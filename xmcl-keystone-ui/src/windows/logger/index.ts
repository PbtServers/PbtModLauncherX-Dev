import { i18n } from '@/i18n'
import { vuetify } from '@/vuetify'
import 'virtual:uno.css'
import { createApp, defineComponent, h, provide, ref } from 'vue'
import App from './App.vue'
import { baseService } from './baseService'
import { usePreferredDark } from '@vueuse/core'
import { kTheme, useTheme } from '@/composables/theme'
import { ServiceFactoryImpl } from '@/composables'
import { ThemeServiceKey } from '@xmcl/runtime-api'

const search = window.location.search.slice(1)
const pairs = search.split('&').map((pair) => pair.split('='))
const locale = pairs.find(p => p[0] === 'locale')?.[1] ?? 'en'
const theme = pairs.find(p => p[0] === 'theme')?.[1] ?? 'dark'

const app = createApp(defineComponent({
  setup(props, context) {
    provide(kTheme, useTheme(ref(undefined), new ServiceFactoryImpl().getService(ThemeServiceKey)))

    baseService.call('getSettings').then(state => state).then(state => {
      ;(i18n.global.locale as any).value = state.locale
      updateTheme(state.theme)
      state.subscribe('localeSet', (locale) => {
        ;(i18n.global.locale as any).value = locale
      })
      state.subscribe('themeSet', (theme) => {
        updateTheme(state.theme)
      })
    })

    const preferDark = usePreferredDark()
    const updateTheme = (theme: string) => {
      if (theme === 'system') {
        vuetify.theme.change(preferDark.value ? 'dark' : 'light')
      } else if (theme === 'dark') {
        vuetify.theme.change('dark')
      } else if (theme === 'light') {
        vuetify.theme.change('light')
      }
    }
    updateTheme(theme)

    return () => h(App)
  },
}))

app.use(i18n)
app.use(vuetify)

app.mount('#app')

