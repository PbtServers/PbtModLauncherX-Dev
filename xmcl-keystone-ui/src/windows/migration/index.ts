import { DEFAULT_LAUNCHER_LOCALE, resolveLauncherLocale } from '@xmcl/runtime-api'
import { i18n } from '@/i18n'
import { resolveVuetifyLocale } from '@/util/locale'
import { vuetify } from '@/vuetify'
import { usePreferredDark } from '@vueuse/core'
import 'virtual:uno.css'
import { createApp, defineComponent, h } from 'vue'
import App from './App.vue'

// Lazily-importable locale bundles, same glob the main window uses.
const localeLoaders = import.meta.glob('../../../locales/*.yaml')

/** Read the saved renderer preference before the settings service is ready. */
async function setupLocale() {
  let preferred = DEFAULT_LAUNCHER_LOCALE
  try {
    preferred = localStorage.getItem('locale') || DEFAULT_LAUNCHER_LOCALE
  } catch {
    preferred = DEFAULT_LAUNCHER_LOCALE
  }
  const locale = resolveLauncherLocale(preferred)
  vuetify.locale.current.value = resolveVuetifyLocale(locale)
  if (typeof document !== 'undefined') {
    document.documentElement.dir = locale === 'ar' || locale === 'ar-EG' ? 'rtl' : 'ltr'
  }
  ;(i18n.global.locale as any).value = locale
  if (locale === 'en' || locale === 'es-ES' || locale === 'ca') return
  const loader = localeLoaders[`../../../locales/${locale}.yaml`]
  if (!loader) return
  try {
    const message: any = await loader()
    i18n.global.setLocaleMessage(locale, message.default)
    ;(i18n.global.locale as any).value = locale
  } catch {
    ;(i18n.global.locale as any).value = DEFAULT_LAUNCHER_LOCALE
    vuetify.locale.current.value = 'es'
    document.documentElement.dir = 'ltr'
    // Spanish is bundled, so the window still renders if a dynamic locale fails.
  }
}

function bootstrap() {
  const app = createApp(defineComponent({
    setup(props, context) {
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
      updateTheme('dark')

      return () => h(App)
    },
  }))

  app.use(i18n)
  app.use(vuetify)

  app.mount('#app')
}

setupLocale().finally(bootstrap)


