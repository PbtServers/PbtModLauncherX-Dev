<template>
  <div v-if="currentUrl" class="non-moveable flex flex-grow-0 items-center">
    <span ref="trackViewport" class="audio-track-viewport" :title="currentTitle" :aria-label="t('audioPlayer.currentTrack', { name: currentTitle })">
      <span ref="trackContent" :key="currentUrl" class="audio-track-title" :class="{ 'audio-track-title--scrolling': !lowResourceMode && scrollDistance > 0 }" :style="{ '--track-distance': `${-scrollDistance}px`, '--track-duration': `${Math.max(5, scrollDistance / 18 + 3)}s` }">
        {{ currentTitle }}
      </span>
    </span>
    <v-btn icon variant="text" size="x-small" @click="prev">
      <v-icon class="mr-0"> skip_previous </v-icon>
    </v-btn>
    <v-btn icon variant="text" size="x-small" @click="play">
      <v-icon class="mr-0">
        {{ playing ? 'pause' : 'play_arrow' }}
      </v-icon>
    </v-btn>
    <v-btn icon variant="text" size="x-small" @click="next">
      <v-icon class="mr-0"> skip_next </v-icon>
    </v-btn>
    <v-btn icon variant="text" size="x-small" @click="shuffle = !shuffle">
      <v-icon class="mr-0">
        {{ shuffle ? 'shuffle' : 'repeat' }}
      </v-icon>
    </v-btn>
    <v-menu location="top">
      <template #activator="{ props }">
        <v-btn icon variant="text" size="x-small" v-bind="props" @wheel="onWheel">
          <v-icon class="mr-0"> volume_up </v-icon>
        </v-btn>
      </template>
      <v-slider
        v-model="volume"
        direction="vertical"
        hide-details
        :step="0.01"
        :max="1"
        :min="0"
        density="compact"
        @wheel="onWheel"
      />
    </v-menu>
    <audio ref="audio" :src="currentUrl" :type="currentMineType" />
  </div>
</template>
<script lang="ts" setup>
import { injection } from '@/util/inject'
import { mediaTitle } from '@/util/mediaTitle'
import { useLocalStorage, useMediaControls, useResizeObserver } from '@vueuse/core'
import { useLowResourceMode } from '@/composables/lowResource'
import { kTheme } from '@/composables/theme'
import { kInstanceLaunch } from '@/composables/instanceLaunch'

defineProps<{}>()

const { currentTheme } = injection(kTheme)
const { t } = useI18n()
const { enabled: lowResourceMode } = useLowResourceMode()
const index = ref(0)
const currentBackgroundMusics = computed(() => currentTheme.value?.backgroundMusic || [])
const currentUrl = computed(() => currentBackgroundMusics.value[index.value]?.url)
const currentMineType = computed(() => currentBackgroundMusics.value[index.value]?.mimeType)
const currentTitle = computed(() => mediaTitle(currentBackgroundMusics.value[index.value]))
const trackViewport = ref<HTMLElement | null>(null)
const trackContent = ref<HTMLElement | null>(null)
const scrollDistance = ref(0)
function measureTrackTitle() {
  scrollDistance.value = Math.max(0, (trackContent.value?.scrollWidth ?? 0) - (trackViewport.value?.clientWidth ?? 0))
}
useResizeObserver([trackViewport, trackContent], measureTrackTitle)
watch(currentTitle, () => { void nextTick().then(measureTrackTitle) })
watch(() => currentBackgroundMusics.value.length, length => {
  if (index.value >= length) index.value = 0
})

const audio = ref<HTMLAudioElement | null>(null)
const { playing, volume, ended } = useMediaControls(audio)

const shuffle = useLocalStorage('audioShuffle', false)

onMounted(() => {
  playing.value = localStorage.getItem('audioPlaying') === 'true'
})

watch(playing, (v) => {
  localStorage.setItem('audioPlaying', v.toString())
})

const { gameProcesses } = injection(kInstanceLaunch)

let lastState = undefined as boolean | undefined
watch(
  computed(() => gameProcesses.value.length),
  (cur, last) => {
    if (cur > 0 && last === 0) {
      lastState = playing.value
      audio.value?.pause()
    } else if (cur === 0 && last > 0) {
      if (lastState) {
        audio.value?.play()
      }
    }
  },
)

onMounted(() => {
  const v = localStorage.getItem('audioVolume')
  if (v) {
    volume.value = parseFloat(v)
  }
})

watch(volume, (v) => {
  localStorage.setItem('audioVolume', v.toString())
})

const play = () => {
  playing.value = !playing.value
}
const next = async () => {
  const count = currentBackgroundMusics.value.length
  if (!count) return
  audio.value?.pause()
  // play next
  if (!shuffle.value) {
    index.value = (index.value + 1) % count
  } else {
    // should not play the same music
    index.value = count === 1 ? 0 : (index.value + 1 + Math.floor(Math.random() * (count - 1))) % count
  }
  await nextTick()
  audio.value?.play()
}
const prev = async () => {
  if (!currentBackgroundMusics.value.length) return
  audio.value?.pause()
  // play prev
  index.value =
    (index.value - 1 + currentBackgroundMusics.value.length) % currentBackgroundMusics.value.length
  await nextTick()
  audio.value?.play()
}

watch(ended, (isEnded) => {
  if (isEnded) {
    if (currentBackgroundMusics.value.length > 1) {
      next()
    } else {
      audio.value?.play()
    }
  }
})

const onWheel = (e: WheelEvent) => {
  volume.value = Math.max(0, Math.min(1, volume.value - e.deltaY / 1000))
}
</script>
<style scoped>
.audio-track-viewport {
  max-width: 160px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}
.audio-track-title {
  display: inline-block;
  width: max-content;
  vertical-align: middle;
}
.audio-track-title--scrolling {
  animation: track-scroll var(--track-duration) ease-in-out infinite alternate;
}
@keyframes track-scroll {
  0%, 20% { transform: translateX(0); }
  80%, 100% { transform: translateX(var(--track-distance)); }
}
</style>
