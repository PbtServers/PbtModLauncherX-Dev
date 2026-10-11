<template>
  <v-card variant="outlined" class="pa-4 my-4">
    <v-card-title>{{ t('pbtadmin.title') }}</v-card-title>
    <v-alert type="info" variant="tonal" class="mb-3">{{ t('pbtadmin.privacy') }}</v-alert>
    <v-select :model-value="provider" :items="providerItems" item-title="title" item-value="id" :label="t('pbtadmin.provider')" @update:model-value="selectProvider" />
    <v-switch v-model="historyEnabled" :label="t('pbtadmin.history')" :hint="t('pbtadmin.historyHint')" persistent-hint />
    <template v-if="provider === 'ollama'">
      <v-text-field v-model="modelsDirectory" :label="t('pbtadmin.modelsDirectory')" />
      <v-checkbox v-model="externalConsent" :label="t('pbtadmin.externalConsent')" />
      <v-btn :disabled="checking" @click="saveStorage">{{ t('pbtadmin.saveStorage') }}</v-btn>
      <v-btn :loading="checking" :disabled="checking" @click="refresh(true)">{{ t('pbtadmin.detect') }}</v-btn>
      <template v-if="status">
        <v-alert v-if="status.runtimeError" type="warning">{{ t(status.runtimeError === 'ollama_runtime_missing' ? 'pbtadmin.integratedMissing' : 'pbtadmin.integratedFailed') }}</v-alert>
        <p v-if="status.freeStorageBytes !== undefined">{{ t('pbtadmin.freeStorage', { size: gib(status.freeStorageBytes) }) }}</p>
        <p v-if="!status.runtimeError">{{ t(status.error === 'connectionFailed' || status.error === 'invalidResponse' ? 'pbtadmin.detectFailed' : status.running ? 'pbtadmin.running' : status.installed === true ? 'pbtadmin.stopped' : status.installed === false ? 'pbtadmin.missing' : 'pbtadmin.unknown') }}</p>
        <p>{{ t('pbtadmin.hardware', { total: gib(status.totalMemory), free: gib(status.freeMemory), cpus: status.cpuCount }) }}</p>
        <v-select v-model="model" :items="compatibleModels" item-title="name" item-value="name" :label="t('pbtadmin.model')" :disabled="!status.running" />
        <p v-if="!compatibleModels.length">{{ t('pbtadmin.noModels') }}</p>
        <p v-if="status.models.some(entry => !entry.compatible && entry.chatCompatible)">{{ t('pbtadmin.chatOnly') }}</p>
        <p v-if="status.models.some(entry => !entry.compatible && !entry.chatCompatible)">{{ t('pbtadmin.unsupported') }}</p>
        <p>{{ t('pbtadmin.recommendation') }} {{ status.recommendedModels.join(', ') || t('pbtadmin.lowMemory') }}</p>
        <v-alert v-if="lowFactoryResources" type="warning" class="my-2">
          {{ t('pbtadmin.lowMemory') }} {{ t('pbtadmin.recommendation') }} qwen3:1.7b-q4_K_M
          <v-btn class="mt-2" @click="offerLightModel">{{ t('pbtadmin.setup') }}</v-btn>
        </v-alert>
      </template>
      <v-btn class="my-2" @click="wizard = true">{{ t(!compatibleModels.length ? 'pbtadminInstallQwen' : 'pbtadmin.setup') }}</v-btn>
      <p v-if="download.state !== 'idle'">{{ t(`pbtadmin.download.${download.state}`) }} {{ download.model }} <span v-if="download.total">{{ gib(download.completed || 0) }} / {{ gib(download.total) }} GiB</span></p>
      <v-btn v-if="download.state === 'running'" @click="cancelDownload">{{ t('pbtadmin.cancel') }}</v-btn>
      <p v-if="download.error">{{ t(`pbtadmin.${download.error}`) }}</p>
    </template>
    <p v-else>{{ t('pbtadmin.remote') }}</p>
    <v-alert v-if="error" type="error" class="mt-3">{{ t(error) }}</v-alert>
    <v-dialog v-model="wizard" max-width="640">
      <v-card class="pa-4">
        <v-card-title>{{ t('pbtadmin.setup') }}</v-card-title>
        <p>{{ t('pbtadmin.modelRequired') }}</p>
        <p v-if="status?.runtimeError">{{ t('pbtadmin.integratedMissing') }}</p>
        <v-btn :loading="checking" @click="refresh(true)">{{ t('pbtadmin.detect') }}</v-btn>
        <v-select v-model="downloadModel" :items="LOCAL_AI_MODELS.map(entry => entry.name)" :label="t('pbtadmin.model')" />
        <p>{{ t('pbtadmin.downloadConsent', { model: downloadModel, size: gib(estimatedBytes) }) }}</p>
        <p>{{ t('pbtadmin.modelRam', { size: gib(LOCAL_AI_MODELS.find(entry => entry.name === downloadModel)?.minRamBytes || 0) }) }}</p>
        <p v-if="status?.freeStorageBytes !== undefined">{{ t('pbtadmin.freeStorage', { size: gib(status.freeStorageBytes) }) }}</p>
        <v-checkbox v-model="consent" :label="t('pbtadmin.consent')" />
        <v-card-actions>
          <v-btn @click="wizard = false">{{ t('pbtadmin.close') }}</v-btn>
          <v-btn :disabled="!consent || !status?.running || download.state === 'running'" :loading="starting" @click="startDownload">{{ t('pbtadmin.downloadNow') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AgentServiceKey, AGENT_PROVIDER_PRESETS, LOCAL_AI_MODELS, OLLAMA_ENDPOINT, type OllamaStatus, type OllamaDownloadStatus } from '@xmcl/runtime-api'
import { useService } from '@/composables/service'
import { useAgentSettings } from '@/composables/agent/settings'

const { t, locale } = useI18n()
const service = useService(AgentServiceKey)
const modelsDirectory = ref('')
const externalConsent = ref(false)
async function saveStorage() {
  try {
    await service.configureLocalRuntime({ modelsDirectory: modelsDirectory.value, externalOrigin: externalConsent.value ? 'http://127.0.0.1:11434' : undefined })
    await refresh()
  } catch { error.value = 'pbtadmin.integratedFailed' }
}
const settings = useAgentSettings()
const { endpoint, model, historyEnabled } = settings
const providers = AGENT_PROVIDER_PRESETS
const providerNames: Record<string, string> = { ollama: 'Ollama', openai: 'OpenAI', anthropic: 'Anthropic', gemini: 'Gemini' }
const providerItems = computed(() => providers.map(entry => ({ ...entry, title: providerNames[entry.id] || t('setting.aiAgentEndpoint') })))
const customSelected = ref(false)
const provider = computed(() => customSelected.value ? 'compatible' : providers.find(entry => entry.endpoint === (endpoint.value || OLLAMA_ENDPOINT))?.id || 'compatible')
const status = ref<OllamaStatus>()
const download = ref<OllamaDownloadStatus>({ state: 'idle' })
const compatibleModels = computed(() => status.value?.models.filter(entry => entry.compatible || entry.chatCompatible) || [])
const checking = ref(false)
const starting = ref(false)
const error = ref('')
const wizard = ref(false)
const consent = ref(false)
const downloadModel = ref<(typeof LOCAL_AI_MODELS)[number]['name']>('qwen3:4b-q4_K_M')
const lowFactoryResources = computed(() => !!status.value && !status.value.recommendedModels.includes('qwen3:4b-q4_K_M'))
function offerLightModel() {
  downloadModel.value = 'qwen3:1.7b-q4_K_M'
  consent.value = false
  wizard.value = true
}
const estimatedBytes = computed(() => LOCAL_AI_MODELS.find(entry => entry.name === downloadModel.value)?.estimatedBytes || 0)
const gib = (bytes: number) => new Intl.NumberFormat(locale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(bytes / 1024 ** 3)
watch([wizard, downloadModel], () => { consent.value = false })
function selectProvider(id: string) {
  const preset = providers.find(entry => entry.id === id)
  if (!preset) return
  customSelected.value = id === 'compatible'
  endpoint.value = preset.endpoint
  model.value = ''
  if (id === 'ollama') void refresh()
}
async function refresh(activate = false) {
  if (checking.value) return
  checking.value = true
  try {
    if (activate) await settings.activateLocal()
    status.value = await service.getOllamaStatus()
    await refreshStorage()
    await settings.refreshStatus()
    error.value = ''
  } catch { error.value = 'pbtadmin.detectFailed' }
  finally { checking.value = false }
}
async function refreshStorage() {
  const storage = await service.getLocalRuntimeStorage()
  modelsDirectory.value = storage.modelsDirectory
  externalConsent.value = !!storage.externalOrigin
}
async function startDownload() {
  if (!consent.value) return
  starting.value = true
  try {
    const preview = await service.prepareOllamaDownload(downloadModel.value)
    // The checkbox is tied to the displayed model/size and cleared on every selection change.
    if (!consent.value || preview.model !== downloadModel.value || preview.estimatedBytes !== estimatedBytes.value) return
    await service.startOllamaDownload(preview.confirmationId)
    download.value = await service.getOllamaDownloadStatus()
    wizard.value = false
  } catch { error.value = 'pbtadmin.downloadFailed' }
  finally { starting.value = false }
}
async function cancelDownload() {
  await service.cancelOllamaDownload().catch(() => { error.value = 'pbtadmin.downloadFailed' })
}
let poll: ReturnType<typeof setInterval> | undefined
let polling = false
onMounted(async () => {
  await settings.ready.catch(() => { error.value = 'pbtadmin.settingsFailed' })
  if (provider.value === 'ollama') {
    status.value = settings.ollamaStatus.value
    await refreshStorage().catch(() => { error.value = 'pbtadmin.detectFailed' })
  }
  poll = setInterval(async () => {
    if (polling) return
    polling = true
    try {
      const previous = download.value.state
      download.value = await service.getOllamaDownloadStatus()
      if (download.value.state === 'completed' && previous !== 'completed') await refresh()
    } catch { error.value = 'pbtadmin.detectFailed' }
    finally { polling = false }
  }, 1000)
})
onUnmounted(() => clearInterval(poll))
</script>
