<script setup lang="ts">
import { useInstanceIconSource } from '@/composables/instanceIconSource'
import { BuiltinImages } from '@/constant'
const props = defineProps<{ src?: string }>()
const displayed = useInstanceIconSource(() => props.src)
</script>

<template>
  <v-img :src="displayed || (src ? BuiltinImages.minecraft : '')">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </v-img>
</template>
