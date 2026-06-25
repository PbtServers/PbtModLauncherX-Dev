/* eslint-disable no-unused-vars */

// declare electron static for static file serving
/* eslint-disable no-unused-vars */

// declare electron static for static file serving

declare module '@node-rs/crc32-wasm32-wasi' {
  export function crc32(input: Buffer, crc?: number): number
  export function crc32c(input: Buffer, crc?: number): number
}

declare module '*?worker' {
  import { Worker, WorkerOptions } from 'worker_threads'

  export const path: string
  /**
   * The helper to create the worker
   */
  export default function (options?: WorkerOptions): Worker
}

// declare module 'fs-extra' {
//   export * from 'fs-extra'
// }
declare module '*.png' {
  /**
   * The path of the static file
   */
  const path: string
  export default path
}
declare module '*.webp' {
  /**
   * The path of the static file
   */
  const path: string
  export default path
}
declare module '*.svg' {
  /**
   * The path of the static file
   */
  const path: string
  export default path
}

declare module '*.gif' {
  /**
   * The path of the static file
   */
  const path: string
  export default path
}

declare module '*.vbs' {
  const path: string
  export default path
}

declare module 'undici/lib/core/symbols' {
  export const kDestroy: unique symbol
  export const kClose: unique symbol
  export const kDispatch: unique symbol
  export const kRunning: unique symbol
  export const kClients: unique symbol
}

declare module 'undici/lib/dispatcher-base' {
  import { Dispatcher } from 'undici'
  import { kClose, kDestroy, kRunning } from 'undici/lib/core/symbols'

  declare abstract class DispatcherBase extends Dispatcher {
    readonly destroyed: boolean
    readonly closed: boolean

    get [kRunning](): number

    abstract [kClose](): Promise<void>
    abstract [kDestroy](err?: any): Promise<void>
  }

  export default DispatcherBase
}

declare module 'create-desktop-shortcuts' {
  interface WindowsShortcut {
    filePath: string
    outputPath?: string
    name?: string
    comment?: string
    icon?: string
    arguments?: string
    windowMode?: 'normal' | 'maximized' | 'minimized'
    hotkey?: string
    workingDirectory?: string
    VBScriptPath?: string
  }

  interface LinuxShortcut {
    filePath: string
    outputPath?: string
    name?: string
    comment?: string
    icon?: string
    type?: 'Link' | 'Directory' | 'Application'
    terminal?: boolean
    chmod?: boolean
    arguments?: string
  }

  interface OsxShortcut {
    filePath: string
    outputPath?: string
    name?: string
    overwrite?: boolean
  }

  export interface ShortcutOptions {
    onlyCurrentOS?: boolean
    verbose?: boolean
    customLogger?: (message: string, error?: object) => void
    windows?: WindowsShortcut
    linux?: LinuxShortcut
    osx?: OsxShortcut
  }

  export default function createDesktopShortcut(options: ShortcutOptions): boolean
}
