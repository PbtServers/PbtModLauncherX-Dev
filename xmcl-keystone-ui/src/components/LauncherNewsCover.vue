<template>
  <div ref="container" class="news-cover">
    <v-img :src="src" :alt="title" :aspect-ratio="16 / 9" height="100%" cover @error="failed">
      <template #placeholder><v-img :src="NEWS_IMAGE_FALLBACK" height="100%" :aspect-ratio="16 / 9" contain :alt="title" /></template>
    </v-img>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import { NEWS_IMAGE_FALLBACK } from '@/util/customLauncherNews'
import { fetchNewsImage } from '@/util/newsImage'

const props = defineProps<{ url: string; title: string; custom: boolean }>()
const container = ref<HTMLElement>()
const visible = useElementVisibility(container)
const src = ref(NEWS_IMAGE_FALLBACK)
let controller: AbortController | undefined
let objectUrl: string | undefined
let attempted = ''
function release() {
  controller?.abort()
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = undefined
}
function failed() {
  if (src.value !== NEWS_IMAGE_FALLBACK) console.debug('[custom-news] Image failed; using launcher artwork')
  src.value = NEWS_IMAGE_FALLBACK
}
watch(() => props.url, () => { release(); attempted = ''; src.value = props.custom ? NEWS_IMAGE_FALLBACK : props.url }, { immediate: true })
watch([visible, () => props.url], async ([shown, url]) => {
  if (!shown || !props.custom || url === NEWS_IMAGE_FALLBACK || attempted === url) return
  attempted = url
  const current = controller = new AbortController()
  try {
    const blob = await fetchNewsImage(url, AbortSignal.any([current.signal, AbortSignal.timeout(8000)]))
    if (current.signal.aborted) return
    objectUrl = URL.createObjectURL(blob)
    src.value = objectUrl
  } catch { if (!current.signal.aborted) failed() }
}, { immediate: true })
onUnmounted(release)
</script>

<style scoped>
.news-cover { width: 100%; height: 100%; overflow: hidden; }
</style>
