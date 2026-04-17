// src/providers/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import dei file di traduzione
import en from "../locales/en.json";
import it from "../locales/it.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import el from "../locales/el.json";
import ja from "../locales/ja.json";
import ru from "../locales/ru.json";
import zh from "../locales/zh.json";

// Inizializzazione di i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
    es: { translation: es },
    fr: { translation: fr },
    el: { translation: el },
    ja: { translation: ja },
    ru: { translation: ru },
    zh: { translation: zh }
  },
  lng: "it",              // lingua iniziale
  fallbackLng: "en",      // fallback se manca la traduzione
  interpolation: {
    escapeValue: false    // React fa già l’escaping
  }
});

export default i18n;
