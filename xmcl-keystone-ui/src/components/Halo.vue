<template>
  <div
    ref="halo"
    style="filter: blur(10px);"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import {
  Camera, Color, LinearFilter, Mesh,
  PlaneGeometry, RGBAFormat, Scene,
  ShaderMaterial,
  TextureLoader, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget,
} from 'three'

// TODO: fix this after refactor halo
// TODO: verify RGBAFormat vs RGBFormat
window.THREE = {
  LinearFilter,
  WebGLRenderTarget,
  RGBFormat: RGBAFormat,
  RGBAFormat,
  Vector3,
  Color,
  Vector2,
  WebGLRenderer,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Mesh,
  PlaneGeometry,
  Camera,
} as any

// @ts-ignore
// eslint-disable-next-line import/first
import initHalo from './halo'
// eslint-disable-next-line import/first
import { injection } from '@/util/inject'
// eslint-disable-next-line import/first
import { kTheme } from '@/composables/theme'

export default defineComponent({
  props: { paused: { type: Boolean, default: false } },
  setup(props) {
    const halo = ref(null as any)
    const { isDark } = injection(kTheme)
    let effect: any
    function updateAnimation() {
      if (!effect) return
      cancelAnimationFrame(effect.req)
      effect.prevNow = undefined
      effect.lastDrawTime = undefined
      effect.animationLoop()
      if (props.paused) cancelAnimationFrame(effect.req)
    }
    useResizeObserver(halo, () => { if (props.paused) updateAnimation() })
    onMounted(() => {
      effect = initHalo({
        el: halo.value,
        THREE: window.THREE,
        lightTheme: isDark.value ? 0 : 1,
      })
      updateAnimation()
      watch(isDark, (dark) => {
        effect?.setOptions?.({ lightTheme: dark ? 0 : 1 })
        if (props.paused) updateAnimation()
      })
    })
    watch(() => props.paused, updateAnimation)
    onUnmounted(() => effect?.destroy())
    return { halo }
  },
})

</script>
