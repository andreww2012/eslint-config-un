
import type { DefineComponent } from 'vue'
type LazyComponent<T> = DefineComponent<{}, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

export const MyButton: typeof import("../../app/components/MyButton.vue")['default']
export const NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const LazyMyButton: LazyComponent<typeof import("../../app/components/MyButton.vue")['default']>

export const componentNames: string[]
