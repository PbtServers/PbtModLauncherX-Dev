import type { DriveStep } from 'driver.js'
import { ref, type InjectionKey, type Ref } from 'vue'

// PbtModLauncherX keeps guided tutorials disabled in every launcher window.
export function useTutorialModel() {
  return { steps: ref<DriveStep[]>([]), start: async () => {} }
}

export const kTutorial: InjectionKey<ReturnType<typeof useTutorialModel>> = Symbol('tutorial')

export function useTutorial(_steps: Ref<DriveStep[]>) {}
