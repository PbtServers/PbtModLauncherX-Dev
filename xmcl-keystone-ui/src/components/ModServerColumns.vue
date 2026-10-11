<template>
  <button type="button" class="mod-server-columns" :aria-label="`${t('modServer.type')}: ${typeText}; ${t('modServer.server')}: ${serverText}. ${t('modServer.explain')}`" @click.stop="emit('explain')">
    <span class="mod-server-column"><span class="mod-server-heading">{{ t('modServer.type') }}</span><span>{{ typeText }}</span></span>
    <span class="mod-server-column"><span class="mod-server-heading">{{ t('modServer.server') }}</span><span>{{ serverText }}</span></span>
  </button>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ServerModClassification } from '@xmcl/runtime-api'
const props = defineProps<{ classification?: ServerModClassification }>()
const emit = defineEmits<{ explain: [] }>()
const { t } = useI18n()
const typeText = computed(() => t(`serverExport.side.${props.classification?.type.value ?? 'unknown'}`))
const serverText = computed(() => t(`modServer.necessity.${props.classification?.server.value ?? 'unknown'}`))
</script>
<style scoped>
.mod-server-columns { display: grid; grid-template-columns: 96px 96px; gap: 8px; flex-shrink: 0; text-align: left; font-size: 12px; line-height: 16px; }
.mod-server-column { display: flex; flex-direction: column; }
.mod-server-heading { font-size: 10px; opacity: .75; }
.mod-server-columns:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
</style>
