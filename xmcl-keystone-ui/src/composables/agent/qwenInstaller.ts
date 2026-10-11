import { computed, ref } from 'vue'
import type { AgentService, OllamaDownloadStatus } from '@xmcl/runtime-api'

export const QWEN_MODEL = 'qwen3:4b-q4_K_M'
export const QWEN_BYTES = 2_600_000_000
export type InstallPhase = 'missing' | 'preparing' | 'downloading' | 'completed' | 'cancelled' | 'error' | 'installed'

export function createQwenInstaller(
  service: Pick<AgentService, 'prepareOllamaDownload' | 'startOllamaDownload' | 'getOllamaDownloadStatus' | 'cancelOllamaDownload'>,
  hooks: { activate: () => Promise<void>; refresh: () => Promise<void>; installed: () => boolean },
  now = Date.now,
) {
  const phase = ref<InstallPhase>(hooks.installed() ? 'installed' : 'missing')
  const download = ref<OllamaDownloadStatus>({ state: 'idle' })
  const speed = ref<number>()
  const errorKey = ref('')
  let generation = 0
  let sample: { bytes: number; total: number; time: number } | undefined
  const percent = computed(() => {
    const { completed, total } = download.value
    return total && completed !== undefined ? Math.min(100, Math.max(0, completed / total * 100)) : undefined
  })
  const busy = computed(() => phase.value === 'preparing' || phase.value === 'downloading')

  async function start(consent: boolean) {
    if (!consent || busy.value || phase.value === 'installed') return
    const current = ++generation
    phase.value = 'preparing'
    errorKey.value = ''
    download.value = { state: 'idle' }
    sample = undefined
    speed.value = undefined
    try {
      await hooks.activate()
      if (current !== generation) return
      if (hooks.installed()) { phase.value = 'installed'; return }
      const preview = await service.prepareOllamaDownload(QWEN_MODEL)
      if (current !== generation) return
      if (preview.model !== QWEN_MODEL || preview.estimatedBytes !== QWEN_BYTES) throw new Error('downloadFailed')
      await service.startOllamaDownload(preview.confirmationId)
      if (current !== generation) { await service.cancelOllamaDownload(); return }
      phase.value = 'downloading'
    } catch (error) {
      if (current !== generation) return
      phase.value = 'error'
      const code = error instanceof Error ? error.message : ''
      errorKey.value = code === 'ollama_storage_insufficient' ? 'qwenInstall.storageError' : code.startsWith('ollama_') ? 'pbtadmin.integratedFailed' : 'pbtadmin.downloadFailed'
    }
  }

  async function poll() {
    const current = generation
    try {
      const status = await service.getOllamaDownloadStatus()
      if (current !== generation || status.model && status.model !== QWEN_MODEL) return
      download.value = status
      if (status.state === 'running') {
        phase.value = 'downloading'
        const time = now()
        speed.value = sample && status.total === sample.total && status.completed !== undefined && status.completed > sample.bytes && time > sample.time
          ? (status.completed - sample.bytes) * 1000 / (time - sample.time) : undefined
        sample = status.total && status.completed !== undefined ? { bytes: status.completed, total: status.total, time } : undefined
      } else if (status.state === 'completed' && phase.value !== 'installed' && phase.value !== 'completed') {
        phase.value = 'completed'
        await hooks.refresh()
        if (current === generation && hooks.installed()) phase.value = 'installed'
      } else if (status.state === 'cancelled') phase.value = 'cancelled'
      else if (status.state === 'failed') {
        phase.value = 'error'
        errorKey.value = status.error === 'timeout' ? 'qwenInstall.timeout' : 'pbtadmin.downloadFailed'
      }
    } catch {
      if (current === generation) { phase.value = 'error'; errorKey.value = 'pbtadmin.detectFailed' }
    }
  }

  async function cancel() {
    ++generation
    phase.value = 'cancelled'
    try { await service.cancelOllamaDownload() } catch { phase.value = 'error'; errorKey.value = 'pbtadmin.downloadFailed' }
  }
  async function reconnect() {
    phase.value = 'completed'
    try { await hooks.refresh(); if (hooks.installed()) phase.value = 'installed' } catch { phase.value = 'error'; errorKey.value = 'pbtadmin.detectFailed' }
  }
  return { phase, download, speed, percent, errorKey, busy, start, poll, cancel, reconnect }
}
