import { injection } from '@/util/inject'
import { DriveStep } from 'driver.js'
import { InjectionKey, Ref } from 'vue'

export const kTutorial: InjectionKey<ReturnType<typeof useTutorialModel>> = Symbol('tutorial')

export function useTutorialModel() {
}

export function useTutorial(steps: Ref<DriveStep[]>) {
}
