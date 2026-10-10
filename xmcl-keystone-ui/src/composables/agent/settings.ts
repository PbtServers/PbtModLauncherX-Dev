import { createSharedComposable } from '@vueuse/core'
import {
  AgentServiceKey,
  OLLAMA_ENDPOINT,
  isOllamaEndpoint,
  type OllamaStatus,
} from '@xmcl/runtime-api'
import { useService } from '../service'
import { useLowResourceMode } from '../lowResource'
import { readProviderSnapshot } from './providerSnapshot'
import { providerStatusKey } from './providerStatus'

export const useAgentSettings = createSharedComposable(() => {
  const service = useService(AgentServiceKey)
  const { enabled: lowResourceMode } = useLowResourceMode()
  const manuallyStarted = ref(false)
  async function activateLocal() { await service.activateLocalAgent(); manuallyStarted.value = true; await refreshStatus() }
  async function releaseLocal() { if (await service.releaseLocalAgent()) { manuallyStarted.value = false; await refreshStatus() } }
  const apiKey = ref('')
  const endpoint = ref('')
  const model = ref('')
  const detectedEndpoint = ref('')
  const historyEnabled = ref(true)
  const contextWindow = ref(8192)
  const providerConfigured = ref(false)
  const toolsSupported = ref(true)
  const ollamaStatus = ref<OllamaStatus>()
  const runtimeError = ref('')
  const resolvedMode = ref<'builtin' | 'custom' | 'unconfigured'>('unconfigured')
  const mode = computed(() => resolvedMode.value)
  const loaded = ref(false)
  const error = ref('')
  const checkingAccess = ref(true)
  let accessCheckCount = 1
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let keyTimer: ReturnType<typeof setTimeout> | undefined
  let pendingApiKey = ''
  let keySave = Promise.resolve()
  let keySaveError: Error | undefined
  let settingsSave = Promise.resolve()

  async function refreshStatus() {
    accessCheckCount += 1
    checkingAccess.value = true
    providerConfigured.value = false
    try {
      const snapshot = await readProviderSnapshot(service)
      const { settings } = snapshot
      if (!loaded.value) {
        endpoint.value = settings.endpoint
        model.value = settings.model
        historyEnabled.value = settings.historyEnabled !== false
        loaded.value = true
      }
      ollamaStatus.value = snapshot.status
      runtimeError.value = snapshot.status?.runtimeError || settings.runtimeError || ''
      detectedEndpoint.value = settings.detectedEndpoint || ''
      if (!model.value.trim() && isOllamaEndpoint(endpoint.value || OLLAMA_ENDPOINT) && settings.model) model.value = settings.model
      providerConfigured.value = settings.configured
      toolsSupported.value = settings.toolsSupported !== false
      resolvedMode.value = settings.mode
      contextWindow.value = settings.contextWindow ?? 8192
    } finally {
      accessCheckCount -= 1
      checkingAccess.value = accessCheckCount > 0
    }
  }

  const ready = (async () => {
    try {
      const snapshot = await readProviderSnapshot(service)
      const { settings } = snapshot
      ollamaStatus.value = snapshot.status
      runtimeError.value = snapshot.status?.runtimeError || settings.runtimeError || ''
      endpoint.value = settings.endpoint
      detectedEndpoint.value = settings.detectedEndpoint || ''
      model.value = settings.model
      historyEnabled.value = settings.historyEnabled !== false
      contextWindow.value = settings.contextWindow ?? 8192
      providerConfigured.value = settings.configured
      resolvedMode.value = settings.mode
      loaded.value = true
      toolsSupported.value = settings.toolsSupported !== false
    } catch {
      // IPC failure is recoverable through the explicit connection check.
      runtimeError.value = 'ollama_state_unavailable'
      error.value = 'pbtadmin.detectFailed'
    } finally {
      accessCheckCount -= 1
      checkingAccess.value = accessCheckCount > 0
    }
  })()

  function saveProviderSettings() {
    settingsSave = settingsSave.catch(() => {}).then(async () => {
      await service.setProviderSettings({ endpoint: endpoint.value, model: model.value, historyEnabled: historyEnabled.value })
      await refreshStatus()
    })
    return settingsSave
  }

  watch([endpoint, model, historyEnabled], () => {
    if (!loaded.value) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      saveTimer = undefined
      try { await saveProviderSettings(); error.value = '' } catch { error.value = 'pbtadmin.settingsFailed' }
    }, 300)
  })

  async function flush() {
    await ready
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = undefined
      await saveProviderSettings()
    }
    if (keyTimer) {
      clearTimeout(keyTimer)
      keyTimer = undefined
      await setApiKey(pendingApiKey)
    }
    await Promise.all([settingsSave, keySave])
    if (keySaveError) throw keySaveError
  }

  async function setApiKey(value: string) {
    apiKey.value = value
    await ready
    // Capture the endpoint at call time. If the user switches provider while this
    // write is queued behind an earlier one, the key must still be filed under the
    // provider it was typed for -- and must not resurrect settings for that
    // provider over the newly selected one.
    const target = endpoint.value
    const targetModel = model.value
    keySave = keySave.then(async () => {
      try {
        await service.setProviderSettings({ endpoint: target, model: targetModel, apiKey: value })
        // Only reflect the result in the UI if that provider is still selected.
        if (endpoint.value === target) {
          await refreshStatus()
          keySaveError = undefined
          error.value = ''
        } else {
          // The endpoint just committed belongs to the previous provider; restore
          // the current selection so settings and UI do not drift apart.
          await service.setProviderSettings({ endpoint: endpoint.value, model: model.value, historyEnabled: historyEnabled.value })
        }
      } catch (e) {
        keySaveError = e instanceof Error ? e : new Error(String(e))
        if (endpoint.value === target) error.value = keySaveError.message
      }
    })
    await keySave
  }

  /**
   * Debounced key entry. The debounce lives here rather than in the view so that a
   * provider switch can cancel a still-pending write: otherwise a key typed for the
   * previous provider would land under the newly selected one.
   */
  function updateApiKey(value: string) {
    apiKey.value = value
    pendingApiKey = value
    if (keyTimer) clearTimeout(keyTimer)
    keyTimer = setTimeout(() => {
      keyTimer = undefined
      void setApiKey(pendingApiKey)
    }, 500)
  }

  function cancelPendingApiKey() {
    if (!keyTimer) return
    clearTimeout(keyTimer)
    keyTimer = undefined
  }

  /**
   * Forget the stored key for the currently selected provider. Writing an empty
   * value deletes the secret rather than storing a blank one. Any pending
   * debounced write is cancelled first, so a key typed moments earlier cannot
   * land after the clear and silently resurrect it.
   */
  async function clearApiKey() {
    cancelPendingApiKey()
    await setApiKey('')
  }

  const resolvedEndpoint = computed(() => endpoint.value.trim() || OLLAMA_ENDPOINT)
  const resolvedModel = computed(() => model.value.trim() || '')
  const statusKey = computed(() => checkingAccess.value && isOllamaEndpoint(resolvedEndpoint.value) ? 'ollamaRuntime.checking' : lowResourceMode.value && !manuallyStarted.value && isOllamaEndpoint(resolvedEndpoint.value) ? 'lowResources.agentPaused' : providerStatusKey(resolvedEndpoint.value, resolvedModel.value, providerConfigured.value, ollamaStatus.value, toolsSupported.value))
  const configured = computed(() => {
    if (checkingAccess.value) return false
    return providerConfigured.value
  })

  /**
   * API keys are stored per provider and never read back into the renderer, so on a
   * provider switch the input is cleared and `configured` is re-read for the newly
   * selected provider. The endpoint must be persisted first, since the backend keys
   * the secret off the saved endpoint.
   */
  let refreshToken = 0
  watch(endpoint, () => {
    if (!loaded.value) return
    cancelPendingApiKey()
    apiKey.value = ''
    providerConfigured.value = false
    const token = ++refreshToken
    // Wait for any key write that was already in flight: it commits the previous
    // provider's endpoint, so reading `configured` before it settles would report
    // the wrong provider's state.
    void keySave.then(() => flush()).then(async () => {
      const snapshot = await readProviderSnapshot(service)
      const { settings } = snapshot
      // Ignore a stale response if the user switched again while this was in flight.
      if (token === refreshToken) {
        ollamaStatus.value = snapshot.status
        runtimeError.value = snapshot.status?.runtimeError || settings.runtimeError || ''
        providerConfigured.value = settings.configured
        toolsSupported.value = settings.toolsSupported !== false
        resolvedMode.value = settings.mode
        contextWindow.value = settings.contextWindow ?? 8192
      }
    }).catch(e => {
      if (token === refreshToken) error.value = e instanceof Error ? e.message : String(e)
    })
  })

  return {
    lowResourceMode, manuallyStarted, activateLocal, releaseLocal,
    localProvider: computed(() => isOllamaEndpoint(resolvedEndpoint.value)),
    apiKey,
    toolsSupported,
    statusKey,
    endpoint,
    model,
    historyEnabled,
    contextWindow,
    configured,
    mode,
    loaded,
    error,
    ready,
    refreshStatus,
    flush,
    setApiKey,
    updateApiKey,
    clearApiKey,
    resolvedEndpoint,
    detectedEndpoint,
    runtimeError,
    resolvedModel,
  }
})
