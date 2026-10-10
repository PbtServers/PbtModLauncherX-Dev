<script setup lang="ts">
import InstanceIcon from '@/components/InstanceIcon.vue'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { useVModel } from '@vueuse/core'
import { validateInstanceIconImage } from '@/util/instanceIconImage'

const { t } = useI18n()
const props = defineProps<{
  icon: string
  color?: string
}>()

const emit = defineEmits<{
  (event: 'update:icon', value: string): void
}>()

const iconModel = useVModel(props, 'icon', emit)

const dragOver = ref(false)
const error = ref(false)
const draft = ref(props.icon)
let revision = 0
let disposed = false
watch(() => props.icon, (value) => { draft.value = value })
onBeforeUnmount(() => { disposed = true; revision++ })

async function applyIcon(value: string | null) {
  if (disposed) return
  const current = ++revision
  error.value = false
  try {
    if (value) await validateInstanceIconImage(value)
    if (current !== revision) return
    iconModel.value = value || ''
    draft.value = value || ''
  } catch {
    if (current !== revision) return
    error.value = true
    draft.value = props.icon
  }
}

function pickIconFile() {
  const current = ++revision
  windowController
    .showOpenDialog({
      title: t('instanceSetting.icon'),
      filters: [
        {
          name: t('instanceSetting.icon'),
          extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'svg'],
        },
      ],
      properties: ['openFile'],
    })
    .then((result) => {
      if (result.canceled || disposed || current !== revision) return
      const filePath = result.filePaths[0]
      if (filePath) {
        void applyIcon(`http://launcher/media?path=${encodeURIComponent(filePath)}&revision=${Date.now()}-${revision}`)
      }
    })
}

function onDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  const path = windowController.getPathForFile(file)
  if (path) {
    void applyIcon(`http://launcher/media?path=${encodeURIComponent(path)}&revision=${Date.now()}-${revision}`)
  }
}
</script>

<template>
  <v-card :color="color" class="change-icon-card transition-colors" width="400">
    <v-card-item>
      <template #prepend>
        <v-avatar
          variant="text"
          size="48"
          rounded="lg"
          class="change-icon-card__preview"
          :class="{ 'change-icon-card__preview--empty': !iconModel }"
        >
          <InstanceIcon v-if="iconModel" :src="iconModel" :alt="t('instance.icon')" />
          <v-icon v-else size="24">image</v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-subtitle-1 pa-0">
        {{ t('instance.icon') }}
      </v-card-title>
      <v-card-subtitle class="pa-0 text-caption">
        {{ t('instance.iconHint') }}
      </v-card-subtitle>
      <template #append>
        <v-btn
          v-shared-tooltip="() => t('modified.reset')"
          :disabled="!iconModel"
          icon
          variant="text"
          density="comfortable"
          @click="applyIcon('')"
        >
          <v-icon>restart_alt</v-icon>
        </v-btn>
      </template>
    </v-card-item>

    <v-card-text class="pt-0">
      <div
        class="change-icon-card__drop mb-3"
        :class="{ 'change-icon-card__drop--active': dragOver }"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="onDrop"
        @click="pickIconFile"
      >
        <v-icon class="mb-1">upload_file</v-icon>
        <span class="text-caption">
          {{ t('instanceSetting.icon') }}
        </span>
      </div>

      <v-text-field
        v-model="draft"
        :label="t('instance.iconUrl')"
        :error-messages="error ? t('instance.iconError') : []"
        variant="outlined"
        density="compact"
        clearable
        prepend-inner-icon="link"
        @blur="applyIcon(draft)"
        @click:clear="applyIcon('')"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.change-icon-card__preview {
  background-color: rgba(var(--v-theme-on-surface), 0.06);
}
.change-icon-card__preview--empty {
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.24);
}
.change-icon-card__drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.24);
  border-radius: 8px;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  user-select: none;
}
.change-icon-card__drop:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
.change-icon-card__drop--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
