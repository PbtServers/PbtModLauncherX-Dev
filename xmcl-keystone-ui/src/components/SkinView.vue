<template>
  <canvas
    ref="canvasRef"
    role="img"
    :aria-label="t('modelPreview.label')"
    @dragover="emit('dragover', $event)"
    @drop="emit('drop', $event)"
  />
</template>

<script lang=ts setup>
import { IdleAnimation, SkinViewer, WalkingAnimation, RunningAnimation } from 'skinview3d'
import steveSkin from '@/assets/steve_skin.png'
import { useLowResourceMode } from '@/composables/lowResource'
import { useDocumentVisibility } from '@vueuse/core'

const props = withDefaults(defineProps<{
  width?: number
  height?: number
  cape?: string
  skin?: string
  slim?: boolean
  name?: string
  animation?: 'walking' | 'none' | 'idle' | 'running'
  paused?: boolean
  interactiveMotion?: boolean
}>(), {
  width: 210,
  height: 400,
  slim: undefined,
  cape: undefined,
  name: 'Steve',
  skin: '',
  animation: 'idle',
})

const canvasRef = ref(null)
const { t } = useI18n()
const { enabled: lowResourceMode, reducedMotion } = useLowResourceMode()
const visibility = useDocumentVisibility()
const data = {
  disposed: false,
}
const animationObject = computed(() => {
  if (props.animation === 'none' || lowResourceMode.value || (reducedMotion.value && !props.interactiveMotion)) {
    return null
  }
  if (props.animation === 'walking') {
    return new WalkingAnimation()
  }
  if (props.animation === 'idle') {
    const idle = new IdleAnimation()
    idle.speed = 0.35
    return idle
  }
  if (props.animation === 'running') return new RunningAnimation()
  return null
})
onUnmounted(() => {
  data.disposed = true
  viewer?.dispose()
})

const emit = defineEmits(['model', 'dragover', 'drop', 'error'])

let lastCapeLoad = Promise.resolve()

let viewer: SkinViewer | undefined
const loopPaused = computed(() => !!props.paused || visibility.value !== 'visible' || animationObject.value === null)
function renderVisible() {
  if (viewer && !data.disposed && !props.paused && visibility.value === 'visible') viewer.render()
}

let lastLoad = Promise.resolve()
let skinGeneration = 0
async function loadSkin() {
  const generation = ++skinGeneration
  const url = props.skin || steveSkin
  const activeViewer = viewer
  if (!url || !activeViewer || data.disposed) return

  await lastLoad.catch(() => undefined)
  if (viewer !== activeViewer || data.disposed || generation !== skinGeneration) return
  const load = activeViewer.loadSkin(url, {
    model: typeof props.slim === 'undefined' ? 'auto-detect' : props.slim ? 'slim' : 'default',
  })
  lastLoad = load
  try {
    await load
    if (viewer === activeViewer && !data.disposed && generation === skinGeneration) {
      emit('model', activeViewer.playerObject.skin.modelType)
      renderVisible()
    }
  } catch (e) {
    if (viewer !== activeViewer || data.disposed || generation !== skinGeneration) return
    if (url !== steveSkin) {
      await activeViewer.loadSkin(steveSkin).catch(() => undefined)
      renderVisible()
    }
    if (e instanceof Error && /^Bad skin size: \d+x\d+$/.test(e.message)) {
      emit('error', 'invalid-skin-size')
      return
    }
    emit('error', 'load-failed')
  }
}

onMounted(() => {
  try { viewer = new SkinViewer({
    canvas: canvasRef.value!,
    width: props.width,
    height: props.height,
    nameTag: props.name || undefined,
    fov: 45,
    zoom: 0.5,
  }) } catch { emit('error', 'webgl-unavailable'); return }

  viewer.animation = animationObject.value
  viewer.renderPaused = loopPaused.value
  viewer.controls.addEventListener('change', () => { if (viewer?.renderPaused) renderVisible() })

  const activeViewer = viewer
  lastLoad = activeViewer.loadSkin(steveSkin).then(() => {
    if (viewer === activeViewer) renderVisible()
  }).catch(() => { emit('error', 'load-failed') })

  loadSkin()
  if (props.cape) {
    lastCapeLoad = viewer.loadCape(props.cape).catch(() => { emit('error', 'load-failed') })
  }
})

watch(animationObject, (v) => {
  if (viewer) { viewer.animation = v; renderVisible() }
})

watch(() => props.skin, loadSkin)
watch(() => props.slim, loadSkin)

watch(() => props.cape, (v) => {
  const activeViewer = viewer
  if (!activeViewer) return
  if (v) {
    lastCapeLoad = lastCapeLoad.catch(() => undefined).then(async () => {
      if (data.disposed || viewer !== activeViewer || props.cape !== v) return
      try { await activeViewer.loadCape(v); renderVisible() } catch { emit('error', 'load-failed') }
    })
  } else {
    activeViewer.resetCape()
    renderVisible()
  }
})

watch(() => props.name, (v) => {
  if (viewer) { viewer.nameTag = v || null; renderVisible() }
})

watch(loopPaused, (paused) => {
  if (!viewer) return
  viewer.renderPaused = paused
  renderVisible()
})
watch(() => [props.width, props.height], () => {
  if (!viewer) return
  viewer.width = props.width
  viewer.height = props.height
  renderVisible()
})
</script>
