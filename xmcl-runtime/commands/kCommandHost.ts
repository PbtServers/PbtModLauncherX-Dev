import type { InjectionKey } from '../app'
import type { BackendCommandHost } from './BackendCommandHost'

/**
 * Registry key for the singleton {@link BackendCommandHost}. Registered by
 * {@link pluginCommandHost}.
 */
export const kCommandHost: InjectionKey<BackendCommandHost> = Symbol('CommandHost')
