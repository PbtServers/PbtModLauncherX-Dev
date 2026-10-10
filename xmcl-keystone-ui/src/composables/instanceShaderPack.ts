import { BuiltinImages } from '@/constant'
import { ModFile } from '@/util/mod'
import { ProjectFile } from '@/util/search'
import { GameOptionsState, InstanceOptionsServiceKey, InstanceShaderPacksServiceKey } from '@xmcl/runtime-api'
import { InjectionKey, Ref } from 'vue'
import { detectShaderProvider } from './shaderSupport'
import { useShaderPackStatus } from './shaderPackStatus'
import { useResourceParseErrorNotifier } from './resourceParseError'
import { useService } from './service'
import { useState } from './syncableState'
import { ReactiveResourceState } from '@/util/ReactiveResourceState'
import { RuntimeVersions } from '@xmcl/instance'

export const kInstanceShaderPacks: InjectionKey<ReturnType<typeof useInstanceShaderPacks>> = Symbol('InstanceShaderPacks')

export interface InstanceShaderFile extends ProjectFile {
  fileName: string

  size: number

  hash: string
}

export function useInstanceShaderPacks(instancePath: Ref<string>, runtime: Ref<RuntimeVersions>, mods: Ref<ModFile[]>, gameOptions: Ref<GameOptionsState | undefined>) {
  const { watch: watchShaderPacks } = useService(InstanceShaderPacksServiceKey)
  const { editOculusShaderOptions, getOculusShaderOptions, getIrisShaderOptions, editIrisShaderOptions, editShaderOptions } = useService(InstanceOptionsServiceKey)

  const { state, error, isValidating, revalidate } = useState(() => instancePath.value ? watchShaderPacks(instancePath.value) : undefined, ReactiveResourceState)

  useResourceParseErrorNotifier(state)

  const shaderPacks = computed(() => state.value?.files.map(f => ({
    path: f.path,
    version: '',
    enabled: shaderPack.value === f.fileName,
    fileName: f.fileName,
    size: f.size,
    mtime: f.mtime,
    hash: f.hash,
    modrinth: f.metadata.modrinth,
    curseforge: f.metadata.curseforge,
  } as InstanceShaderFile)) || [])
  const shaderMod = computed(() => {
    const provider = instancePath.value ? detectShaderProvider(runtime.value, mods.value, instancePath.value) : undefined
    return provider ? { ...provider, icon: provider.icon || (provider.id === 'optifine' ? BuiltinImages.optifine : undefined) } : undefined
  })
  const { status: shaderPackStatus, refresh: mutateShaderPackOptions, error: optionsError } = useShaderPackStatus(
    instancePath, shaderMod, computed(() => gameOptions.value?.shaderPack), getIrisShaderOptions, getOculusShaderOptions,
  )

  const shaderPack = computed({
    get() {
      console.log(`get shader pack ${shaderPackStatus.value?.[1]}`)
      return shaderPackStatus.value?.[1]
    },
    set(v: string | undefined) {
      if (shaderMod.value?.id === 'optifine') {
        editShaderOptions({
          instancePath: instancePath.value,
          shaderPack: v ?? '',
        })
      } else if (shaderMod.value?.id === 'iris') {
        editIrisShaderOptions({
          instancePath: instancePath.value,
          shaderPack: v ?? '',
        }).then(() => mutateShaderPackOptions())
      } else if (shaderMod.value?.id === 'oculus') {
        editOculusShaderOptions({
          instancePath: instancePath.value,
          shaderPack: v ?? '',
        }).then(() => mutateShaderPackOptions())
      }
    },
  })

  function effect() {
  }

  return {
    shaderMod,
    shaderPack,
    shaderPacks,
    refreshing: isValidating,
    revalidate,
    error,
    optionsError,
    effect,
  }
}
