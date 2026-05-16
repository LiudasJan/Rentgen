import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import lt from './locales/lt';
import pl from './locales/pl';
import uk from './locales/uk';
import es from './locales/es';
import de from './locales/de';
import ptBR from './locales/pt-BR';
import zhCN from './locales/zh-CN';
import fr from './locales/fr';
import th from './locales/th';
import ja from './locales/ja';
import ko from './locales/ko';
import it from './locales/it';
import tr from './locales/tr';
import id from './locales/id';
import vi from './locales/vi';
import hi from './locales/hi';
import nl from './locales/nl';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    lt: { translation: lt },
    pl: { translation: pl },
    uk: { translation: uk },
    es: { translation: es },
    de: { translation: de },
    'pt-BR': { translation: ptBR },
    'zh-CN': { translation: zhCN },
    fr: { translation: fr },
    th: { translation: th },
    ja: { translation: ja },
    ko: { translation: ko },
    it: { translation: it },
    tr: { translation: tr },
    id: { translation: id },
    vi: { translation: vi },
    hi: { translation: hi },
    nl: { translation: nl },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
