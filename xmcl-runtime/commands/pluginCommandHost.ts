import { registerBuiltinCommands } from '@xmcl/runtime-api'
import { LauncherAppPlugin } from '../app'
import { BackendCommandHost, ServiceLocator, createServiceLocator } from './BackendCommandHost'
import type { ServiceConstructor } from '../service/Service'
import { kCommandHost } from './kCommandHost'

export interface PluginCommandHostOptions {
  /**
   * Service constructors used to map `ServiceKey` → ctor for `ctx.call`.
   * Pass the same `definedServices` array the application registers with
   * `pluginServicesHandler`.
   */
  services: ReadonlyArray<ServiceConstructor>
}

/**
 * Registers the {@link BackendCommandHost} on the launcher app DI registry
 * and ensures the built-in commands from `@xmcl/runtime-api` are loaded.
 *
 * After this plugin runs, callers can resolve the host with:
 *
 * ```ts
 * const host = await app.registry.get(kCommandHost)
 * await host.dispatch('instance.launch', input)
 * ```
 */
export const pluginCommandHost = (opts: PluginCommandHostOptions): LauncherAppPlugin => async (app) => {
  registerBuiltinCommands()
  const locator: ServiceLocator = createServiceLocator(opts.services)
  const host = new BackendCommandHost({
    app,
    serviceLocator: locator,
    logger: app.getLogger('CommandHost'),
  })
  app.registry.register(kCommandHost, host)
}
