<template>
  <div class="absolute z-0 h-full w-full">
    <transition
      name="fade-transition"
    >
      <video
        v-if="customBackgroundVideo"
        ref="videoRef"
        :key="`custom-video-${customBackgroundVideo}`"
        class="absolute z-0 h-full w-full object-cover"
        :style="{ filter: `blur(${blur}px)`, 'object-fit': backgroundImageFit }"
        :src="customBackgroundVideo"
        autoplay
        loop
        playsinline
        @loadeddata="updateVideoPlayback"
        :muted="isMuted"
      />
      <Particles
        v-else-if="backgroundType === BackgroundType.PARTICLE"
        :move-enabled="!backgroundPaused"
        color="#dedede"
        class="absolute z-0 h-full w-full"
        :style="{ filter: `blur(${blur}px)` }"
        :click-mode="particleMode"
      />
      <Halo
        v-else-if="backgroundType === BackgroundType.HALO"
        :paused="backgroundPaused"
        class="absolute z-0 h-full w-full"
        :style="{ filter: `blur(${blur}px)` }"
      />
      <img
        v-else-if="backgroundImage?.type === 'image' && backgroundType === BackgroundType.IMAGE"
        :key="backgroundImage.url"
        :src="backgroundImage.url"
        class="absolute z-0 h-full w-full"
        :style="{ filter: `blur(${blur}px)`, 'object-fit': backgroundImageFit }"
      >
      <video
        v-else-if="backgroundImage?.type === 'video' && backgroundType === BackgroundType.VIDEO"
        ref="videoRef"
        :key="`video-${backgroundImage.url}`"
        class="absolute z-0 h-full w-full object-cover"
        :style="{ filter: `blur(${blur}px)`, 'object-fit': backgroundImageFit }"
        :src="backgroundImage.url"
        autoplay
        loop
        playsinline
        @loadeddata="updateVideoPlayback"
        :muted="isMuted"
      />
    </transition>

    <transition
      name="fade-transition"
    >
      <div
        v-if="((backgroundColorOverlay && !isHome) || backgroundType === BackgroundType.NONE) && !customBackgroundVideo"
        class="z-3 absolute h-full w-full"
        :style="{ 'background': backgroundColor }"
      />
    </transition>
  </div>
</template>
<script lang="ts" setup>
import { useLowResourceMode } from '@/composables/lowResource'
import { useDocumentVisibility } from '@vueuse/core'
const { enabled: lowResourceMode } = useLowResourceMode()
const visibility = useDocumentVisibility()
const Halo = defineAsyncComponent(() => import('@/components/Halo.vue'))
const Particles = defineAsyncComponent(() => import('@/components/Particles.vue'))
import { injection } from '@/util/inject'
import { kTheme, BackgroundType } from '@/composables/theme'
import { kInstanceLaunch } from '@/composables/instanceLaunch'
import { kCustomCss } from '@/composables/customCss'
import { inject } from 'vue'

const customCss = inject(kCustomCss)
const customBackgroundVideo = computed(() => customCss?.customBackgroundVideo.value || '')

const { sideBarColor, backgroundColorOverlay, backgroundColor, blur, backgroundImage, backgroundType, particleMode, backgroundImageFit, volume } = injection(kTheme)
const videoRef = ref(null as null | HTMLVideoElement)
const isMuted = computed(() => volume.value <= 0)

const route = useRoute()
const isHome = computed(() => route.path === '/')

watch(volume, (newVolume) => {
  if (videoRef.value) {
    videoRef.value.volume = newVolume
  }
})

const { gameProcesses } = injection(kInstanceLaunch)
const backgroundPaused = computed(() => lowResourceMode.value || visibility.value !== 'visible' || gameProcesses.value.length > 0)

function updateVideoPlayback() {
  if (backgroundPaused.value) videoRef.value?.pause()
  else void videoRef.value?.play().catch(() => {})
}
watch(backgroundPaused, updateVideoPlayback)

watch(videoRef, (v) => {
  if (v) {
    v.volume = volume.value
    updateVideoPlayback()
  }
})

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.volume = volume.value
  }
})

</script>
<style scoped>
.img-container {
  background: radial-gradient(ellipse at top right, transparent, v-bind(sideBarColor) 72%);
  position: absolute;
  min-width: 100%;
  min-height: 100%;
  z-index: 4;
}
</style>
