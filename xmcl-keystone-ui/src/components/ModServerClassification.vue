<template>
  <ModServerColumns :classification="mod?.classification" @explain="openDetails" />
  <v-dialog v-model="shown" max-width="650" scrollable>
    <v-card>
      <v-card-title>{{ t('modServer.explain') }}</v-card-title>
      <v-card-text>
        <p>{{ mod?.ids.join(', ') }} {{ mod?.version }}</p>
        <p>{{ t('modServer.distinction') }}</p>
        <p v-if="!mod?.classification">{{ t('modServer.confidence.low') }}: {{ t('modServer.reason.insufficient') }}</p>
        <template v-for="axis in (['type', 'server'] as const)" :key="axis">
          <h3 class="mt-3">{{ t(`modServer.${axis}`) }}</h3>
          <p v-for="(evidence, index) in mod?.classification?.[axis].evidence" :key="index">
            {{ t(`modServer.source.${evidence.source}`) }} · {{ t(`modServer.confidence.${evidence.confidence}`) }}: {{ t(`modServer.reason.${evidence.reason}`) }}
            <span class="text-xs break-all">{{ evidence.detail }}</span>
          </p>
        </template>
        <p class="mt-2">{{ t('modServer.original') }}: {{ t(`serverExport.side.${mod?.classification?.originalType ?? 'unknown'}`) }} / {{ t(`modServer.necessity.${mod?.classification?.originalServer ?? 'unknown'}`) }}</p>
        <p v-if="mod?.required.length">{{ t('modServer.dependencies') }}: {{ mod.required.join(', ') }}</p>
        <v-alert v-if="mod?.excluded" type="warning">{{ t(`serverExport.reason.${mod.excluded}`) }}</v-alert>
        <v-alert v-if="error" type="error">{{ t('modServer.saveFailed') }}</v-alert>
        <v-select v-model="type" :items="typeItems" :label="t('modServer.manualType')" clearable :disabled="saving || !mod?.sha256" />
        <v-select v-model="server" :items="serverItems" :label="t('modServer.manualServer')" clearable :disabled="saving || !mod?.sha256" />
        <p>{{ t('modServer.manualHint') }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn :disabled="saving" @click="shown = false">{{ t('serverExport.close') }}</v-btn>
        <v-btn :disabled="saving || !mod?.sha256" @click="save(true)">{{ t('modServer.reset') }}</v-btn>
        <v-spacer />
        <v-btn :disabled="saving || !mod?.sha256" :loading="saving" @click="save(false)">{{ t('modServer.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { InstanceIOServiceKey, type ServerExportMod, type ServerModSide, type ServerModNecessity } from '@xmcl/runtime-api'
import { useService } from '@/composables/service'
import ModServerColumns from './ModServerColumns.vue'
const props = defineProps<{ mod?: ServerExportMod; instancePath: string }>()
const emit = defineEmits<{ saved: [] }>()
const { t } = useI18n()
const service = useService(InstanceIOServiceKey)
const shown = ref(false)
const saving = ref(false)
const error = ref(false)
const type = ref<ServerModSide | null>()
const server = ref<ServerModNecessity | null>()
watch(() => [props.instancePath, props.mod?.sha256], () => { shown.value = false })
const typeItems = computed(() => (['client', 'server', 'both', 'unknown'] as const).map(value => ({ value, title: t(`serverExport.side.${value}`) })))
const serverItems = computed(() => (['required', 'recommended', 'no', 'unknown'] as const).map(value => ({ value, title: t(`modServer.necessity.${value}`) })))
function openDetails() {
  type.value = props.mod?.classification?.userDecision?.type; server.value = props.mod?.classification?.userDecision?.server
  error.value = false; shown.value = true
}
async function save(reset: boolean) {
  if (!props.mod?.sha256) return
  saving.value = true; error.value = false
  try {
    await service.setServerModOverride(props.instancePath, props.mod.sha256, reset ? {} : { ...(type.value ? { type: type.value } : {}), ...(server.value ? { server: server.value } : {}) })
    emit('saved'); shown.value = false
  } catch { error.value = true } finally { saving.value = false }
}
</script>
