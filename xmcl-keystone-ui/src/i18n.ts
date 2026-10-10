import { createI18n } from 'vue-i18n'
import en from '../locales/en.yaml'
import es from '../locales/es-ES.yaml'
import ca from '../locales/ca.yaml'

export const i18n = createI18n({
  legacy: false,
  locale: 'es-ES',
  fallbackLocale: 'en',
  silentTranslationWarn: true,
  missingWarn: false,
  fallbackWarn: false,
  messages: { en, 'es-ES': es, ca },
})
