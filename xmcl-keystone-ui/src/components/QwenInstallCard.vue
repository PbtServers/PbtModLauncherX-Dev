<template>
  <v-card class="qwen-install" variant="outlined" :aria-label="t('qwenInstall.title')">
    <div class="qwen-install__heading">
      <v-avatar color="primary" variant="tonal" size="48"><v-icon aria-hidden="true">smart_toy</v-icon></v-avatar>
      <div>
        <div class="text-caption text-medium-emphasis">{{ t('pbtadminLore.name') }}</div>
        <h2 class="text-h6">Qwen3 4B</h2>
      </div>
      <v-chip color="primary" size="small" variant="tonal">{{ t('qwenInstall.local') }}</v-chip>
    </div>
    <p class="text-body-2 text-medium-emphasis">{{ t('qwenInstall.description') }}</p>
    <div class="qwen-install__details text-caption text-medium-emphasis">
      <span><v-icon size="16" aria-hidden="true">download</v-icon> {{ t('qwenInstall.size', { size: gib(QWEN_BYTES) }) }}</span>
      <span><v-icon size="16" aria-hidden="true">memory</v-icon> {{ t('qwenInstall.memory') }}</span>
    </div>
    <div v-if="busy || phase === 'completed'" class="qwen-install__progress">
      <div class="qwen-install__metrics text-body-2" role="status" aria-live="polite">
        <span>{{ t(`qwenInstall.${phase}`) }}</span>
        <strong v-if="percent !== undefined && phase === 'downloading'">{{ number(percent / 100, { style: 'percent', maximumFractionDigits: 0 }) }}</strong>
      </div>
      <v-progress-linear color="primary" rounded height="8" :model-value="phase === 'completed' ? 100 : percent" :indeterminate="phase === 'preparing' || phase === 'downloading' && percent === undefined" :aria-label="t('qwenInstall.progress')" />
      <div v-if="download.total && download.completed !== undefined" class="qwen-install__metrics text-caption text-medium-emphasis">
        <span>{{ gib(download.completed) }} / {{ gib(download.total) }} GiB</span>
        <span v-if="speed !== undefined">{{ number(speed / 1024 ** 2) }} MiB/s</span>
      </div>
    </div>
    <v-alert v-if="phase === 'error'" type="error" variant="tonal" density="compact" role="alert">{{ t(errorKey) }}</v-alert>
    <p v-if="phase === 'cancelled'" class="text-body-2" role="status">{{ t('qwenInstall.cancelled') }}</p>
    <div class="qwen-install__actions">
      <v-btn v-if="busy" variant="tonal" @click="cancel">{{ t('pbtadmin.cancel') }}</v-btn>
      <v-btn v-else-if="phase === 'completed'" color="primary" :loading="settings.checkingAccess.value" @click="reconnect">{{ t('qwenInstall.openChat') }}</v-btn>
      <v-btn v-else color="primary" variant="flat" prepend-icon="download" @click="confirming = true">{{ t(phase === 'error' || phase === 'cancelled' ? 'qwenInstall.retry' : 'qwenInstall.install') }}</v-btn>
      <v-btn variant="text" size="small" @click="emit('settings')">{{ t('qwenInstall.otherProvider') }}</v-btn>
    </div>
    <v-dialog v-model="confirming" max-width="520" scrollable>
      <v-card>
        <v-card-title>{{ t('qwenInstall.title') }}</v-card-title>
        <v-card-text>
          <p>{{ t('pbtadmin.downloadConsent', { model: QWEN_MODEL, size: gib(QWEN_BYTES) }) }}</p>
          <p class="mt-3">{{ t('pbtadmin.modelRam', { size: number(8) }) }}</p>
          <v-checkbox v-model="consent" :label="t('pbtadmin.consent')" hide-details />
        </v-card-text>
        <v-card-actions class="flex-wrap">
          <v-btn @click="confirming = false">{{ t('pbtadmin.close') }}</v-btn>
          <v-spacer />
          <v-btn color="primary" variant="flat" :disabled="!consent" @click="install">{{ t('qwenInstall.install') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AgentServiceKey } from '@xmcl/runtime-api'
import { useService } from '@/composables/service'
import { useAgentSettings } from '@/composables/agent/settings'
import { createQwenInstaller, QWEN_MODEL, QWEN_BYTES } from '@/composables/agent/qwenInstaller'

const emit = defineEmits<{ settings: [] }>()
const { t, locale } = useI18n()
const settings = useAgentSettings()
const service = useService(AgentServiceKey)
const { phase, download, speed, percent, errorKey, busy, start, poll, cancel, reconnect } = createQwenInstaller(service, {
  activate: async () => { if (!settings.ollamaStatus.value?.running) await settings.activateLocal() },
  refresh: settings.refreshStatus,
  installed: () => settings.configured.value,
})
const confirming = ref(false)
const consent = ref(false)
watch(confirming, () => { consent.value = false })
const number = (value: number, options: Intl.NumberFormatOptions = { minimumFractionDigits: 1, maximumFractionDigits: 1 }) => new Intl.NumberFormat(locale.value, options).format(value)
const gib = (bytes: number) => number(bytes / 1024 ** 3)
async function install() {
  if (!consent.value) return
  confirming.value = false
  await start(true)
}
let timer: ReturnType<typeof setInterval> | undefined
let polling = false
let disposed = false
async function update() {
  if (polling || disposed) return
  polling = true
  try { await poll() } finally { polling = false }
}
onMounted(async () => {
  await settings.ready
  if (disposed) return
  await update()
  if (!disposed) timer = setInterval(update, 1000)
})
onUnmounted(() => { disposed = true; clearInterval(timer) })
</script>

<style scoped>
.qwen-install { width: 100%; max-width: 520px; padding: 20px; display: flex; flex: 0 0 auto; flex-direction: column; gap: 16px; border-color: rgba(var(--v-theme-primary), .25); border-radius: 12px; background: rgb(var(--v-theme-surface)); text-align: start; box-shadow: none; }
.qwen-install__heading { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.qwen-install h2, .qwen-install p { margin: 0; }
.qwen-install__heading > div:nth-child(2) { flex: 1; min-width: 150px; }
.qwen-install__details, .qwen-install__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.qwen-install__details span { display: flex; align-items: center; gap: 6px; }
.qwen-install__progress { display: flex; flex-direction: column; gap: 8px; }
.qwen-install__metrics { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.qwen-install__actions :deep(.v-btn__content) { white-space: normal; }
@media (max-height: 500px) { .qwen-install { padding: 12px; gap: 10px; } }
</style>
