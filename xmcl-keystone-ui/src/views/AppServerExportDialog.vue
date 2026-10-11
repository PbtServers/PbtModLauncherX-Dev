<template>
  <v-dialog v-model="isShown" max-width="900" scrollable :persistent="busy">
    <v-card>
      <v-card-title>{{ t('serverExport.title') }}</v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-3">{{ t('serverExport.description') }}</v-alert>
        <v-text-field v-model="packageName" :label="t('serverExport.packageName')" :disabled="busy" />
        <div class="flex gap-2 items-center">
          <v-text-field v-model="destination" :label="t('serverExport.destination')" readonly />
          <v-btn :disabled="busy" @click="chooseDestination">{{ t('serverExport.browse') }}</v-btn>
        </div>
        <v-checkbox v-model="includeConfig" :label="t('serverExport.includeConfig')" :disabled="busy" />
        <v-checkbox v-model="includeDatapacks" :label="t('serverExport.includeDatapacks')" :disabled="busy" />
        <v-select v-model="world" :items="worlds" clearable :label="t('serverExport.world')" :disabled="busy" />
        <v-checkbox v-model="onlineMetadata" :label="t('serverExport.onlineMetadata')" :disabled="busy" />
        <v-btn :loading="analyzing" :disabled="exporting" @click="analyze">{{ t('serverExport.analyze') }}</v-btn>
        <v-alert v-if="error" type="error" class="mt-3">{{ t('serverExport.failure') }}: {{ t(`serverExport.reason.${error}`) }}</v-alert>
        <v-alert v-if="result" type="success" class="mt-3">{{ t('serverExport.success') }}: {{ result.path }} · SHA-256 {{ result.sha256 }}</v-alert>
        <template v-if="plan">
          <p class="mt-4">Minecraft {{ plan.minecraft }} · {{ plan.loader }} {{ plan.loaderVersion }} · Java {{ plan.recipe?.java ?? '?' }}</p>
          <v-text-field v-model.number="memory" type="number" min="512" max="65536" :label="t('serverExport.memory')" :hint="t('serverExport.memoryHint', { memory: plan.recommendedMemoryMiB })" persistent-hint :disabled="busy" />
          <v-alert v-if="stale" type="warning">{{ t('serverExport.stale') }}</v-alert>
          <v-alert v-for="warning in plan.warnings" :key="warning" type="warning" variant="tonal" class="mt-2">{{ t(`serverExport.reason.${warning}`) }}</v-alert>
          <v-alert v-for="blocker in plan.blockers" :key="blocker" type="error" class="mt-2">{{ t(`serverExport.reason.${blocker}`) }}</v-alert>
          <h3 class="mt-4">{{ t('serverExport.mods') }} ({{ plan.mods.length }})</h3>
          <div style="max-height: 280px; overflow: auto">
            <div v-for="mod in plan.mods" :key="mod.path" class="border-b py-2">
              <div>{{ mod.ids.join(', ') || mod.path }} {{ mod.version }} — {{ t(`serverExport.side.${mod.side}`) }}</div>
              <ModServerColumns :classification="mod.classification" @explain="reviewedMod = mod" />
              <div class="text-xs">{{ mod.evidence.join('; ') }}</div>
              <div v-if="mod.excluded" class="text-warning">{{ t(`serverExport.reason.${mod.excluded}`) }}</div>
              <v-select v-else-if="mod.classification?.server.value !== 'no' && (mod.side === 'unknown' || mod.classification?.server.value === 'unknown')" :model-value="unknownDecisions[mod.path]" :items="decisionItems" :label="t('serverExport.unknownDecision')" :disabled="busy" @update:model-value="value => decide(mod.path, value)" />
              <v-checkbox v-else v-model="selectedPaths" :value="mod.path" :label="t('serverExport.include')" :disabled="busy || mod.classification?.server.value === 'no'" />
            </div>
          </div>
          <v-alert v-if="missing.length" type="error">{{ t('serverExport.reason.missingDependency') }}: {{ missing.join('; ') }}</v-alert>
          <v-alert v-if="requiredOmissions.length" type="warning">{{ t('serverExport.reason.requiredModsExcluded') }}: {{ requiredOmissions.join('; ') }}</v-alert>
          <details v-if="reviewedMod"><summary>{{ t('modServer.explain') }}: {{ reviewedMod.ids.join(', ') }}</summary>
            <p v-for="(evidence, index) in [...(reviewedMod.classification?.type.evidence ?? []), ...(reviewedMod.classification?.server.evidence ?? [])]" :key="index">{{ t(`modServer.source.${evidence.source}`) }} · {{ t(`modServer.confidence.${evidence.confidence}`) }}: {{ t(`modServer.reason.${evidence.reason}`) }} {{ evidence.detail }}</p>
          </details>
          <h3 class="mt-4">{{ t('serverExport.preview') }} ({{ selectedPaths.length + plan.generatedFiles.length }})</h3>
          <v-virtual-scroll :items="plan.files" height="220" :item-height="48">
            <template #default="{ item }">
              <v-checkbox v-model="selectedPaths" :value="item.path" :label="`${item.archivePath} (${item.size} B)${item.excluded ? ' — ' + t('serverExport.reason.' + item.excluded) : ''}`" :disabled="busy || !!item.excluded" density="compact" hide-details />
            </template>
          </v-virtual-scroll>
          <p class="text-xs">{{ plan.generatedFiles.join(', ') }}</p>
          <v-checkbox v-model="rightsReviewed" :label="t('serverExport.rightsReviewed')" :disabled="busy" />
          <v-checkbox v-model="confirmed" :label="t('serverExport.confirmed')" :disabled="busy" />
          <v-checkbox v-model="aiConsent" :label="t('serverExport.aiConsent')" :disabled="busy" />
          <details v-if="aiConsent"><summary>{{ t('serverExport.aiPreview') }}</summary><pre class="text-xs whitespace-pre-wrap">{{ assistantContext }}</pre></details>
          <v-btn :disabled="!aiConsent || busy || stale || !assistant.available.value || assistant.running.value" variant="text" @click="askPbtAdmin">{{ t('serverExport.askPbtAdmin') }}</v-btn>
          <p v-if="!assistant.available.value" class="text-xs">{{ t('pbtadmin.noModels') }}</p>
          <div v-if="assistant.running.value" class="flex gap-2"><v-progress-circular indeterminate size="20" /><v-btn @click="assistant.abort">{{ t('serverExport.cancel') }}</v-btn></div>
          <v-alert v-if="assistant.runError.value" type="warning">{{ t('serverExport.failure') }}</v-alert>
          <pre v-for="(text, index) in assistantReplies" :key="index" class="whitespace-pre-wrap text-sm mt-2">PbtAdmin: {{ text }}</pre>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn :disabled="analyzing" @click="cancel">{{ exporting ? t('serverExport.cancel') : t('serverExport.close') }}</v-btn>
        <v-spacer />
        <v-btn color="primary" :loading="exporting" :disabled="!canExport" @click="exportZip">{{ t('serverExport.export') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { InstanceIOServiceKey, serverExportAssistantContext, serverExportMissingDependencies, serverExportRequiredOmissions, type ServerExportPlan, type ServerExportResult, type ServerExportMod } from '@xmcl/runtime-api'
import ModServerColumns from '@/components/ModServerColumns.vue'
import { useService } from '@/composables/service'
import { useDialog } from '@/composables/dialog'
import { useLocalAgent } from '@/composables/agent/local'
import { computed, ref, watch } from 'vue'

const { t, locale } = useI18n()
const service = useService(InstanceIOServiceKey)
const { isShown, parameter } = useDialog('export-server')
const plan = ref<ServerExportPlan>()
const reviewedMod = ref<ServerExportMod>()
const assistantScope = ref('server-export-uninitialized')
// Same provider, streaming, cancellation, history and identity architecture as 10.A.
// No instance context, passive events or tools that could read private files.
const assistant = useLocalAgent({ agentId: 'launcher', getScope: () => assistantScope.value, getLocale: () => locale.value, createTools: async () => [], getSessionContext: () => ({ scope: 'global' }) })
const assistantReplies = computed(() => assistant.messages.value.filter(message => message.role === 'assistant').map(message => typeof message.content === 'string' ? message.content : (message.content ?? []).filter(part => part.type === 'text').map(part => 'text' in part ? part.text : '').join('')))
const result = ref<ServerExportResult>()
const packageName = ref('server')
const destination = ref('')
const includeConfig = ref(false)
const includeDatapacks = ref(false)
const onlineMetadata = ref(false)
const world = ref<string | null>()
const worlds = ref<string[]>([])
const memory = ref(2048)
const selectedPaths = ref<string[]>([])
const unknownDecisions = ref<Record<string, 'include' | 'exclude'>>({})
const rightsReviewed = ref(false)
const confirmed = ref(false)
const aiConsent = ref(false)
const error = ref('')
const stale = ref(false)
const analyzing = ref(false)
const exporting = ref(false)
const busy = computed(() => analyzing.value || exporting.value)
const decisionItems = computed(() => [{ title: t('serverExport.include'), value: 'include' }, { title: t('serverExport.exclude'), value: 'exclude' }])
const missing = computed(() => plan.value ? serverExportMissingDependencies(plan.value.mods, new Set(selectedPaths.value), plan.value.loader) : [])
const requiredOmissions = computed(() => serverExportRequiredOmissions(plan.value?.mods ?? [], new Set(selectedPaths.value)))
const assistantContext = computed(() => plan.value ? serverExportAssistantContext(plan.value, selectedPaths.value) : '')
const unknownReady = computed(() => plan.value?.mods.filter(mod => (mod.side === 'unknown' || mod.classification?.server.value === 'unknown') && mod.classification?.server.value !== 'no' && !mod.excluded).every(mod => !!unknownDecisions.value[mod.path]))
const canExport = computed(() => !!plan.value?.recipe && !plan.value.blockers.length && !busy.value && !stale.value && !!destination.value && !!packageName.value && confirmed.value && rightsReviewed.value && unknownReady.value && !missing.value.length)

watch([includeConfig, includeDatapacks, onlineMetadata, world], () => { if (plan.value) stale.value = true; confirmed.value = false; aiConsent.value = false })
watch([packageName, destination, memory, selectedPaths, unknownDecisions], () => { confirmed.value = false; aiConsent.value = false }, { deep: true })
watch(isShown, (shown) => {
  if (!shown) { assistant.abort(); if (plan.value && !exporting.value) void service.cancelServerExport(plan.value.id); return }
  plan.value = undefined; result.value = undefined; error.value = ''; stale.value = false
  includeConfig.value = false; includeDatapacks.value = false; onlineMetadata.value = false; world.value = undefined; worlds.value = []
  destination.value = ''; packageName.value = 'server'; rightsReviewed.value = false; confirmed.value = false; aiConsent.value = false
  void analyze()
})

async function chooseDestination() {
  const selection = await windowController.showOpenDialog({ title: t('serverExport.destination'), properties: ['openDirectory', 'createDirectory'] })
  if (!selection.canceled && selection.filePaths[0]) destination.value = selection.filePaths[0]
}
async function analyze() {
  analyzing.value = true; error.value = ''; result.value = undefined; reviewedMod.value = undefined; confirmed.value = false; rightsReviewed.value = false
  try {
    if (plan.value) await service.cancelServerExport(plan.value.id)
    const target = parameter.value?.path
    const analyzed = await service.analyzeServerExport({ instancePath: target, includeConfig: includeConfig.value, includeDatapacks: includeDatapacks.value, onlineMetadata: onlineMetadata.value, world: world.value || undefined, locale: locale.value === 'ca' || locale.value === 'en' ? locale.value : 'es-ES' })
    plan.value = analyzed; worlds.value = analyzed.worlds; memory.value = analyzed.recommendedMemoryMiB
    assistant.abort(); assistantScope.value = `server-export-${analyzed.id}`; await assistant.load(assistantScope.value).catch(() => {})
    selectedPaths.value = [...analyzed.files, ...analyzed.mods].filter(file => file.selected && !file.excluded).map(file => file.path)
    unknownDecisions.value = {}; stale.value = false
  } catch (e) { error.value = errorCode(e) } finally { analyzing.value = false }
}
function decide(path: string, value: 'include' | 'exclude') {
  unknownDecisions.value = { ...unknownDecisions.value, [path]: value }
  selectedPaths.value = selectedPaths.value.filter(selected => selected !== path)
  if (value === 'include') selectedPaths.value.push(path)
}
async function exportZip() {
  if (!plan.value || !canExport.value) return
  exporting.value = true; error.value = ''
  try {
    result.value = await service.exportServerZip({ planId: plan.value.id, destinationDirectory: destination.value, packageName: packageName.value, memoryMiB: Number(memory.value), selectedPaths: [...selectedPaths.value], unknownDecisions: { ...unknownDecisions.value }, confirmed: confirmed.value, rightsReviewed: rightsReviewed.value })
  } catch (e) { error.value = errorCode(e) } finally { exporting.value = false; stale.value = true; confirmed.value = false }
}
async function cancel() {
  if (plan.value) await service.cancelServerExport(plan.value.id)
  if (!exporting.value) isShown.value = false
}
async function askPbtAdmin() {
  if (!aiConsent.value || !plan.value || stale.value) return
  const prompt = `${t('serverExport.aiPrompt')}\n${assistantContext.value}`
  await assistant.send(prompt).catch(() => {})
}
function errorCode(error: unknown) {
  const value = error instanceof Error ? error.message : ''
  if (value.includes('EACCES') || value.includes('EPERM')) return 'readError'
  if (value.includes('EEXIST')) return 'destinationExists'
  return ['unsupportedLoader', 'metadataUnavailable', 'archiveCollision', 'privacy', 'secret', 'absolutePath', 'symlink', 'unsupportedFile', 'tooLarge', 'readError', 'clientOnly', 'incompatibleLoader', 'incompatibleVersion', 'missingDependency', 'invalidSelection', 'unknownDecisionRequired', 'confirmationRequired', 'expiredPlan', 'changedFiles', 'invalidMemory', 'unsafePath', 'invalidWorld', 'destinationInsideInstance', 'destinationExists', 'unsupportedRecipe', 'unsupportedInstance', 'untrustedSource', 'invalidVersion', 'tooManyFiles'].includes(value) ? value : 'exportFailed'
}
</script>
