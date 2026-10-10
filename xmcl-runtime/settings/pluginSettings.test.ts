import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { AppManifest, SettingSchema, Settings, SharedState } from '@xmcl/runtime-api'
import { join } from 'path'
import * as fsExtra from 'fs-extra'

vi.mock('fs-extra', () => ({
  readJson: vi.fn(),
  writeJson: vi.fn(),
}))

vi.mock('~/service', () => ({
  ServiceStateManager: class MockServiceStateManager {
    registerStatic<T>(state: T, key: string) {
      return state
    }
  },
}))

describe('pluginSettings', () => {
  let mockApp: any
  let mockManifest: AppManifest
  let mockState: SharedState<Settings>
  let mockLogger: any
  let subscribeCallback: (() => void) | null = null
  let registeredDisposer: (() => Promise<void>) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    subscribeCallback = null
    registeredDisposer = null

    mockLogger = {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    }

    const settings = new Settings()
    mockState = Object.assign(settings, {
      id: 'settings',
      subscribeAll: vi.fn((cb: () => void) => {
        subscribeCallback = cb
      }),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      unsubscribeAll: vi.fn(),
      revalidate: vi.fn(),
    }) as unknown as SharedState<Settings>

    mockManifest = {} as AppManifest

    mockApp = {
      appDataPath: '/mock/app/data',
      registry: {
        get: vi.fn().mockResolvedValue({
          registerStatic: vi.fn().mockReturnValue(mockState),
        }),
        register: vi.fn(),
      },
      getLogger: vi.fn().mockReturnValue(mockLogger),
      registryDisposer: vi.fn((disposer: () => Promise<void>) => {
        registeredDisposer = disposer
      }),
      host: {
        getLocale: vi.fn().mockReturnValue('en-US'),
      },
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should load settings from setting.json', async () => {
    const mockSettings: SettingSchema = SettingSchema.parse({
      locale: 'zh-CN',
      autoDownload: true,
      theme: 'light',
      maxSockets: 32,
    })

    vi.mocked(fsExtra.readJson).mockResolvedValue(mockSettings)

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    // Wait for the async readJson to complete
    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })

    expect(fsExtra.readJson).toHaveBeenCalledWith(join('/mock/app/data', 'setting.json'))
  })

  test('uses Spanish without a saved locale', async () => {
    vi.mocked(fsExtra.readJson).mockResolvedValue({})

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })

    expect(mockApp.host.getLocale).not.toHaveBeenCalled()
    expect(mockState.locale).toBe('es-ES')
  })

  test('uses Spanish for an unsupported saved locale', async () => {
    vi.mocked(fsExtra.readJson).mockResolvedValue({ locale: 'en-GB' })

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })

    // Unsupported saved preferences fall back to Spanish.
    expect(mockState.locale).toBe('es-ES')
  })

  test.each(['en-US', 'de', 'ca', 'es-ES', 'zh-CN'])('uses Spanish independently of system locale %s', async (locale) => {
    vi.mocked(fsExtra.readJson).mockResolvedValue({})
    mockApp.host.getLocale.mockReturnValue(locale)
    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)
    await vi.waitFor(() => expect(mockApp.registry.register).toHaveBeenCalled())
    expect(mockState.locale).toBe('es-ES')
    expect(mockApp.host.getLocale).not.toHaveBeenCalled()
  })

  test.each(['es-ES', 'ca', 'en', 'en-IN', 'fr', 'zh-CN'])('keeps saved locale %s over the system language', async (locale) => {
    vi.mocked(fsExtra.readJson).mockResolvedValue({ locale })
    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)
    await vi.waitFor(() => expect(mockApp.registry.register).toHaveBeenCalled())
    expect(mockState.locale).toBe(locale)
    expect(mockApp.host.getLocale).not.toHaveBeenCalled()
  })

  test.each(['ca', 'en', 'en-IN', 'fr'])('persists a manual switch to %s and reloads it', async (locale) => {
    vi.mocked(fsExtra.readJson).mockResolvedValue({})
    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)
    await vi.waitFor(() => expect(mockApp.registry.register).toHaveBeenCalled())
    expect(mockState.locale).toBe('es-ES')
    mockState.localeSet(locale)
    subscribeCallback!()
    await registeredDisposer!()
    const saved = vi.mocked(fsExtra.writeJson).mock.calls.at(-1)![1]
    expect(saved.locale).toBe(locale)
    vi.mocked(fsExtra.readJson).mockResolvedValue(saved)
    mockState.localeSet('es-ES')
    await pluginSettings(mockApp, mockManifest)
    await vi.waitFor(() => expect(mockState.locale).toBe(locale))
    expect(mockApp.host.getLocale).not.toHaveBeenCalled()
  })

  test.each(['', 'unsupported', null, 123])('uses Spanish for invalid saved preference %s', async (locale) => {
    vi.mocked(fsExtra.readJson).mockResolvedValue({ locale })
    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)
    await vi.waitFor(() => expect(mockApp.registry.register).toHaveBeenCalled())
    expect(mockState.locale).toBe('es-ES')
  })

  test('should handle missing setting.json gracefully', async () => {
    vi.mocked(fsExtra.readJson).mockRejectedValue(new Error('File not found'))

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })
    
    // Verify settings are initialized with Spanish defaults.
    expect(mockState.locale).toBe('es-ES')
    expect(mockState.theme).toBe('dark')
    expect(mockState.developerMode).toBe(false)
    expect(mockState.autoDownload).toBe(false)
    expect(mockState.httpProxy).toBe('')
    expect(mockState.httpProxyEnabled).toBe(false)
    expect(mockState.globalHideLauncher).toBe(true)
    expect(mockState.discordPresence).toBe(true)
    expect(mockState.enableDedicatedGPUOptimization).toBe(true)
  })

  test('should save settings when state changes', async () => {
    vi.useFakeTimers()
    vi.mocked(fsExtra.readJson).mockResolvedValue({})
    vi.mocked(fsExtra.writeJson).mockResolvedValue(undefined)

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(subscribeCallback).not.toBeNull()
    })

    // Trigger a state change
    subscribeCallback!()

    // Fast-forward past the debounce time (1000ms)
    await vi.advanceTimersByTimeAsync(1100)

    expect(fsExtra.writeJson).toHaveBeenCalledWith(
      join('/mock/app/data', 'setting.json'),
      expect.any(Object),
      { spaces: 2 },
    )
  })

  test('should flush pending saves on dispose', async () => {
    vi.useFakeTimers()
    vi.mocked(fsExtra.readJson).mockResolvedValue({})
    vi.mocked(fsExtra.writeJson).mockResolvedValue(undefined)

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(subscribeCallback).not.toBeNull()
    })

    // Trigger a state change
    subscribeCallback!()

    // Call the disposer before the debounce time
    expect(registeredDisposer).not.toBeNull()
    await registeredDisposer!()

    // Should have flushed the save
    expect(fsExtra.writeJson).toHaveBeenCalled()
  })

  test('should not propagate writeJson failure as unhandled rejection', async () => {
    // Regression: 0.56.7 telemetry showed `Error: EPERM ... open setting.json`
    // hitting 153 users (1.48%→2.44%). The saver previously let writeJson
    // errors bubble up as unhandled rejections that landed in trackException.
    // The fix logs the error and swallows it so the next state change retries.
    vi.useFakeTimers()
    vi.mocked(fsExtra.readJson).mockResolvedValue({})
    const epermErr: any = new Error("EPERM: operation not permitted, open 'setting.json'")
    epermErr.code = 'EPERM'
    vi.mocked(fsExtra.writeJson).mockRejectedValue(epermErr)

    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    try {
      const { pluginSettings } = await import('./pluginSettings')
      await pluginSettings(mockApp, mockManifest)
      await vi.waitFor(() => { expect(subscribeCallback).not.toBeNull() })

      subscribeCallback!()
      await vi.advanceTimersByTimeAsync(1100)

      expect(fsExtra.writeJson).toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalled()
      expect(unhandled).not.toHaveBeenCalled()
    } finally {
      process.off('unhandledRejection', unhandled)
    }
  })



  test('should log error when settings parsing fails', async () => {
    vi.mocked(fsExtra.readJson).mockResolvedValue({ invalidField: 'invalid' })

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })

    // Settings should still be registered even if parsing has issues
    expect(mockApp.registry.register).toHaveBeenCalled()
  })

  test('should re-normalize malformed setting json to valid settings object', async () => {
    // Malformed settings with wrong types - zod will coerce or use defaults
    vi.mocked(fsExtra.readJson).mockResolvedValue({
      locale: '', // empty locale will use host locale
      autoDownload: false,
      theme: 'dark',
      maxSockets: 32,
      unknownField: 'should be ignored', // extra fields are stripped
      globalVmOptions: [], // valid array
    })

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })

    // Verify invalid language settings use the Spanish default.
    expect(mockState.locale).toBe('es-ES') // Spanish default
    expect(mockState.theme).toBe('dark')
    expect(mockState.autoDownload).toBe(false)
    expect(mockState.maxSockets).toBe(32) // value from file
    expect(mockState.globalVmOptions).toEqual([])
    expect(mockState.developerMode).toBe(false) // default value
    expect(mockState.discordPresence).toBe(true) // default from Settings class
  })

  test('should salvage valid fields and use defaults for invalid fields', async () => {
    // Malformed settings with some valid and some invalid fields
    vi.mocked(fsExtra.readJson).mockResolvedValue({
      locale: 12345, // invalid - should be string, will use default
      theme: 'light', // valid - should be preserved
      maxSockets: 128, // valid - should be preserved
      developerMode: 'yes', // invalid - should be boolean, will use default
      httpProxy: 'http://proxy.example.com', // valid - should be preserved
    })

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })

    // Valid fields should be preserved
    expect(mockState.theme).toBe('light') // valid value from file
    expect(mockState.maxSockets).toBe(128) // valid value from file
    expect(mockState.httpProxy).toBe('http://proxy.example.com') // valid value from file

    // Invalid fields should use defaults.
    expect(mockState.locale).toBe('es-ES') // Spanish default
    expect(mockState.developerMode).toBe(false) // default value
  })

  test('should use default settings when json has invalid types and parsing throws', async () => {
    // Malformed settings with types that cause zod parsing to fail
    vi.mocked(fsExtra.readJson).mockResolvedValue({
      locale: 12345, // should be string - causes parse error
      theme: { invalid: 'object' }, // should be enum string
    })

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(mockApp.registry.register).toHaveBeenCalled()
    })

    // Invalid fields use defaults, but settings are still normalized
    // Settings are initialized with normalized defaults
    expect(mockState.locale).toBe('es-ES') // Spanish default
    expect(mockState.theme).toBe('dark') // default value (invalid value was rejected)
    expect(mockState.developerMode).toBe(false)
  })

  test('should save correct content when developerMode changes from false to true', async () => {
    vi.useFakeTimers()
    vi.mocked(fsExtra.readJson).mockResolvedValue({ developerMode: false })
    vi.mocked(fsExtra.writeJson).mockResolvedValue(undefined)

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(subscribeCallback).not.toBeNull()
    })

    // Simulate user changing developerMode from false to true
    mockState.developerMode = true

    // Trigger the subscription callback (simulating state change notification)
    subscribeCallback!()

    // Fast-forward past the debounce time (1000ms)
    await vi.advanceTimersByTimeAsync(1100)

    expect(fsExtra.writeJson).toHaveBeenCalledWith(
      join('/mock/app/data', 'setting.json'),
      {
        locale: 'es-ES',
        autoDownload: false,
        autoInstallOnAppQuit: false,
        allowPrerelease: false,
        apiSetsPreference: '',
        apiSets: [{ name: 'bmcl', url: 'https://bmclapi2.bangbang93.com' }],
        httpProxy: '',
        httpProxyEnabled: false,
        theme: 'dark',
        maxSockets: 64,
        maxAPISockets: 16,
        replaceNatives: 'legacy-only',
        globalMinMemory: 0,
        globalMaxMemory: 0,
        globalAssignMemory: false,
        globalJava: '',
        globalVmOptions: [],
        globalMcOptions: [],
        globalFastLaunch: false,
        globalHideLauncher: true,
        globalShowLog: false,
        globalSyncGameLanguage: false,
        globalDisableAuthlibInjector: false,
        globalDisableElyByAuthlib: false,
        globalPrependCommand: '',
        globalPreExecuteCommand: '',
        globalEnv: {},
        discordPresence: true,
        developerMode: true,
        disableTelemetry: false,
        multiplayerTransport: 'webrtc',
        agentEndpoint: '',
        agentModel: '',
        agentHistoryEnabled: true,
        linuxTitlebar: false,
        enableDedicatedGPUOptimization: true,
        windowTranslucent: false,
        quickActionShortcut: '',
        globalResolution: {},
      },
      { spaces: 2 },
    )
  })

  test('should persist default value instead of malformed value when saving', async () => {
    vi.useFakeTimers()
    vi.mocked(fsExtra.readJson).mockResolvedValue({})
    vi.mocked(fsExtra.writeJson).mockResolvedValue(undefined)

    const { pluginSettings } = await import('./pluginSettings')
    await pluginSettings(mockApp, mockManifest)

    await vi.waitFor(() => {
      expect(subscribeCallback).not.toBeNull()
    })

    // Simulate user setting malformed values directly to the state object
    // These would be invalid according to the schema
    ;(mockState as any).theme = 'invalid-theme' // should be 'dark' | 'light' | 'system'
    ;(mockState as any).maxSockets = 'not-a-number' // should be number
    ;(mockState as any).globalVmOptions = 'not-an-array' // should be array

    // Trigger the subscription callback
    subscribeCallback!()

    // Fast-forward past the debounce time
    await vi.advanceTimersByTimeAsync(1100)

    // The saved data should have default values for malformed fields
    // and preserve valid values for other fields
    expect(fsExtra.writeJson).toHaveBeenCalledWith(
      join('/mock/app/data', 'setting.json'),
      {
        locale: 'es-ES',
        autoDownload: false,
        autoInstallOnAppQuit: false,
        allowPrerelease: false,
        apiSetsPreference: '',
        apiSets: [{ name: 'bmcl', url: 'https://bmclapi2.bangbang93.com' }],
        httpProxy: '',
        httpProxyEnabled: false,
        theme: 'dark', // default value, not 'invalid-theme'
        maxSockets: 64, // default value, not 'not-a-number'
        maxAPISockets: 16,
        replaceNatives: 'legacy-only',
        globalMinMemory: 0,
        globalMaxMemory: 0,
        globalAssignMemory: false,
        globalJava: '',
        globalVmOptions: [], // default value, not 'not-an-array'
        globalMcOptions: [],
        globalFastLaunch: false,
        globalHideLauncher: true,
        globalShowLog: false,
        globalSyncGameLanguage: false,
        globalDisableAuthlibInjector: false,
        globalDisableElyByAuthlib: false,
        globalPrependCommand: '',
        globalPreExecuteCommand: '',
        globalEnv: {},
        discordPresence: true,
        developerMode: false,
        disableTelemetry: false,
        multiplayerTransport: 'webrtc',
        agentEndpoint: '',
        agentModel: '',
        agentHistoryEnabled: true,
        linuxTitlebar: false,
        enableDedicatedGPUOptimization: true,
        windowTranslucent: false,
        quickActionShortcut: '',
        globalResolution: {},
      },
      { spaces: 2 },
    )
  })
})
