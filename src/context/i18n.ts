import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import it from "../locales/it.json";
import en from "../locales/en.json";
import el from "../locales/el.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import ja from "../locales/ja.json";
import ru from "../locales/ru.json";
import zh from "../locales/zh.json";

i18n.use(initReactI18next).init({
  lng: localStorage.getItem("lang") ?? "it",
  fallbackLng: "en",
  supportedLngs: ["it", "en", "es", "fr", "el", "ja", "ru", "zh"],
  nonExplicitSupportedLngs: true,
  load: "languageOnly",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    it: { translation: it },
    en: { translation: en },
    el: { translation: el },
    es: { translation: es },
    fr: { translation: fr },
    ja: { translation: ja },
    ru: { translation: ru },
    zh: { translation: zh },
  },
});

export default i18n;
