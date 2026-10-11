<template>
  <AppMoodBackground
    v-if="!data.fetching"
    variant="ambient"
    data-testid="setup-root"
    class="setup flex h-full w-full flex-col overflow-hidden select-none"
  >
    <v-stepper
      v-model="data.step"
      flat
      class="setup-stepper non-moveable flex h-full min-h-0 flex-col overflow-hidden bg-transparent"
    >
      <v-stepper-header class="setup-stepper-header px-4 py-2">
        <v-stepper-item
          :complete="data.step > 1"
          :editable="data.step > 1"
          :value="1"
          color="primary"
          class="setup-stepper-item"
        >
          {{ t('setup.locale.name') }}
        </v-stepper-item>

        <v-divider class="mx-1" />

        <v-stepper-item
          :complete="data.step > 2"
          :editable="data.step > 2"
          :value="2"
          color="primary"
          class="setup-stepper-item"
        >
          {{ t('setup.appearance.name') }}
        </v-stepper-item>

        <v-divider class="mx-1" />

        <v-stepper-item
          :complete="data.step > 3"
          :editable="data.step > 3"
          :value="3"
          color="primary"
          class="setup-stepper-item"
        >
          {{ t('setup.dataRoot.name') }}
        </v-stepper-item>

        <v-divider class="mx-1" />

        <v-stepper-item :value="4" color="primary" class="setup-stepper-item">
          {{ t('setup.account.name') }}
        </v-stepper-item>
      </v-stepper-header>

      <v-stepper-window
        class="setup-stepper-window"
        transition="setup-step-forward"
        reverse-transition="setup-step-back"
      >
        <v-stepper-window-item
          class="setup-stepper-window-item"
          :value="1"
        >
          <div class="setup-pane-wrap">
            <AppMoodSurface fill>
              <SetLocale
                v-model="localeRef"
              />
            </AppMoodSurface>
          </div>
        </v-stepper-window-item>
        <v-stepper-window-item
          class="setup-stepper-window-item"
          :value="2"
        >
          <div class="setup-pane-wrap">
            <AppMoodSurface fill>
              <SetupAppearance
                v-model="data.path"
                class="h-full"
                :default-path="data.defaultPath"
                :drives="data.drives"
              />
            </AppMoodSurface>
          </div>
        </v-stepper-window-item>
        <v-stepper-window-item
          class="setup-stepper-window-item"
          :value="3"
        >
          <div class="setup-pane-wrap">
            <AppMoodSurface fill>
              <SetDataRoot
                v-model="data.path"
                class="h-full"
                :error="data.pathError"
                :default-path="data.defaultPath"
                :drives="data.drives"
              />
            </AppMoodSurface>
          </div>
        </v-stepper-window-item>
        <v-stepper-window-item
          class="setup-stepper-window-item"
          :value="4"
        >
          <div class="setup-pane-wrap">
            <AppMoodSurface fill>
              <SetupAccount
                v-model="data.instancePath"
                :loading="data.loading"
                @skip="setup"
              />
            </AppMoodSurface>
          </div>
        </v-stepper-window-item>
      </v-stepper-window>
      <v-alert v-if="requestError" type="error" class="mx-4" role="alert">
        {{ t('setup.requestFailed') }}
        <v-btn v-if="hasError" @click="validateSelectedPath">{{ t('setup.retryRequest') }}</v-btn>
      </v-alert>
      <slot name="actions">
        <SetupFooter
          :prev="data.step !== 1"
          next
          :disabled="data.step === 3 && hasError"
          :loading="data.loading"
          :finish="data.step === 4"
          @prev="prev"
          @next="data.step === 4 ? setup() : next()"
        />
      </slot>
    </v-stepper>
  </AppMoodBackground>
  <v-card
    v-else
    class="flex h-full w-full flex-col items-center justify-center"
  >
    <v-img
      class="max-w-50"
      src="http://launcher/icons/logoDark"
    />
    <v-alert v-if="requestError" type="error" role="alert">{{ t('setup.requestFailed') }}</v-alert>
    <v-btn v-if="requestError" @click="loadPreset">{{ t('setup.retryRequest') }}</v-btn>
  </v-card>
</template>

<script lang="ts" setup>
import AppMoodBackground from '@/components/AppMoodBackground.vue'
import AppMoodSurface from '@/components/AppMoodSurface.vue'
import { useService } from '@/composables'
import { kSettingsState } from '@/composables/setting'
import { BackgroundType, kTheme } from '@/composables/theme'
import { injection } from '@/util/inject'
import { setupRequest } from '@/util/setupRequest'
import { BaseServiceKey, Drive, InvalidDirectoryErrorCode, resolveLauncherLocale } from '@xmcl/runtime-api'
import SetupAccount from './SetupAccount.vue'
import SetupAppearance from './SetupAppearance.vue'
import SetDataRoot from './SetupDataRoot.vue'
import SetupFooter from './SetupFooter.vue'
import SetLocale from './SetupLocale.vue'

const emit = defineEmits(['ready'])
const { validateDataDictionary, getEnvironment } = useService(BaseServiceKey)

const next = () => {
  data.step = Number(data.step) + 1
}
const prev = () => {
  data.step = Number(data.step) - 1
}

const { locale, t } = useI18n()
const localeRef = computed({
  get: () => resolveLauncherLocale(state.value?.locale ?? locale.value),
  set: (v) => {
    state.value?.localeSet(resolveLauncherLocale(v ?? locale.value))
  },
})

const data = reactive({
  step: 1,
  fetching: true,
  minecraftPath: '',
  instancePath: '',
  path: '',
  pathError: '' as InvalidDirectoryErrorCode,
  defaultPath: '',
  loading: false,
  drives: [] as Drive[],
  theme: 'system',
})
provide('setup', data)
const requestError = ref(false)
const completing = ref(false)
async function loadPreset() {
  requestError.value = false
  try {
    const { minecraftPath, defaultPath, locale: initialLocale, drives } = await setupRequest(() => bootstrap.preset())
    locale.value = initialLocale
    data.minecraftPath = minecraftPath
    data.instancePath = minecraftPath
    data.path = defaultPath
    data.defaultPath = defaultPath
    data.drives = drives
    data.fetching = false
  } catch {
    requestError.value = true
    console.warn('[startup] setup preset failed or timed out')
  }
}
void loadPreset()

const hasError = computed(() => !!data.pathError && data.pathError !== 'exists')
let validationRevision = 0
async function validateSelectedPath() {
  if (completing.value) return
  const revision = ++validationRevision
  const newPath = data.path
  const current = () => revision === validationRevision && !completing.value
  data.loading = true
  data.pathError = undefined
  requestError.value = false
  try {
    const reason = await setupRequest(() => validateDataDictionary(newPath))
    if (current()) data.pathError = reason
  } catch {
    if (current()) {
      requestError.value = true
      data.pathError = 'bad'
    }
  } finally {
    if (current()) data.loading = false
  }
}
watch(() => data.path, validateSelectedPath)

const { isDark, currentTheme, saveCurrentTheme } = injection(kTheme)

const updateTheme = (theme: 'dark' | 'system' | 'light') => {
  if (theme === 'system') {
    currentTheme.value.dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  } else if (theme === 'dark') {
    currentTheme.value.dark = true
  } else {
    currentTheme.value.dark = false
  }
}

updateTheme(data.theme as any)

watch(() => data.theme, () => {
  updateTheme(data.theme as any)
})

const { state } = injection(kSettingsState)

async function persistInitialTheme() {
  // The wizard mutates `currentTheme` in-place when it picks defaults
  // (dark mode + Halo background on GPU machines). `useTheme()` does not
  // auto-persist those mutations, so we must explicitly save here —
  // otherwise the first launch shows Halo but `theme.json` is never
  // written and the next launch falls back to `BackgroundType.NONE`.
  try {
    const e = await setupRequest(() => getEnvironment(), 5_000)
    if (e.gpu && isDark.value) {
      currentTheme.value.backgroundType = BackgroundType.HALO
    }
  } catch {
    console.warn('[startup] optional environment detection failed or timed out')
  }
  try {
    await saveCurrentTheme()
  } catch {
    console.warn('[startup] initial theme persistence failed')
  }
}

async function setup() {
  if (data.loading || hasError.value) return
  data.loading = true
  completing.value = true
  const selectedPath = data.path
  requestError.value = false
  try {
    await setupRequest(() => bootstrap.bootstrap(selectedPath), 30_000)
  } catch {
    completing.value = false
    data.loading = false
    requestError.value = true
    console.warn('[startup] setup completion failed or timed out')
    return
  }
  emit('ready', { ...data, path: selectedPath })
  if (state.value) {
    state.value.localeSet(locale.value)
  } else {
    const dismiss = watch(state, (s) => {
      if (s) {
        s.localeSet(locale.value)
        dismiss()
      }
    })
  }
  // Environment detection may wait on the network. It should never block the
  // user from leaving onboarding after the data root has been accepted.
  void persistInitialTheme()
}
</script>

<style>
.setup .v-stepper-header {
  flex: 0 0 auto;
}

.setup-stepper-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  backdrop-filter: blur(10px);
}

.setup-stepper-item {
  border-radius: 12px;
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.setup-stepper-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
  transform: translateY(-1px);
}

.setup .v-stepper-window {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  overflow: hidden;
}

.setup .v-stepper-window .v-window__container {
  height: 100%;
}

.setup .v-stepper-window-item {
  height: 100%;
  overflow: auto;
  overflow-x: hidden;
}

.setup-pane-wrap {
  padding: 12px 16px 16px;
}

.setup .v-stepper.v-sheet {
  overflow: hidden;
}

.setup-step-forward-enter-active,
.setup-step-forward-leave-active,
.setup-step-back-enter-active,
.setup-step-back-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.setup-step-forward-enter-from,
.setup-step-back-leave-to {
  opacity: 0;
  transform: translateX(22px) scale(0.985);
}

.setup-step-forward-leave-to,
.setup-step-back-enter-from {
  opacity: 0;
  transform: translateX(-22px) scale(0.985);
}

@media (prefers-reduced-motion: reduce) {
  .setup-step-forward-enter-active,
  .setup-step-forward-leave-active,
  .setup-step-back-enter-active,
  .setup-step-back-leave-active,
  .setup-stepper-item {
    transition: none;
  }
}

</style>
