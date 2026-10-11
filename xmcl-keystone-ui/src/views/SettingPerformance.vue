<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { injection } from '@/util/inject'
import { kSettingsState } from '@/composables/setting'
import SettingCard from '@/components/SettingCard.vue'
import SettingItemSwitcher from '@/components/SettingItemSwitcher.vue'
const { t } = useI18n()
const { state } = injection(kSettingsState)
const enabled = computed({
  get: () => state.value?.lowResourceMode ?? false,
  set: value => { state.value?.lowResourceModeSet(value) },
})
</script>
<template>
  <SettingCard>
    <SettingItemSwitcher v-model="enabled" icon="speed" :title="t('lowResources.name')" :description="t('lowResources.description')" />
  </SettingCard>
</template>
