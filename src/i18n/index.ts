import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import lt from './locales/lt';
import pl from './locales/pl';
import uk from './locales/uk';
import es from './locales/es';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    lt: { translation: lt },
    pl: { translation: pl },
    uk: { translation: uk },
    es: { translation: es },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
