import React from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "it", native: "Italiano", english: "Italian", flag: "🇮🇹" },
  { code: "en", native: "English", english: "English", flag: "🇬🇧" },
  { code: "es", native: "Español", english: "Spanish", flag: "🇪🇸" },
  { code: "fr", native: "Français", english: "French", flag: "🇫🇷" },
  { code: "el", native: "Ελληνικά", english: "Greek", flag: "🇬🇷" },
  { code: "ja", native: "日本語", english: "Japanese", flag: "🇯🇵" },
  { code: "ru", native: "Русский", english: "Russian", flag: "🇷🇺" },
  { code: "zh", native: "中文", english: "Chinese", flag: "🇨🇳" },
];

const LanguageSettings: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const loadResources = async (code: string) => {
    // Ora punta direttamente a public/locales/it.json
    const url = `/locales/${code}.json`; 
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Errore caricamento lingua");
    return res.json();
  };

  const handleChange = async (code: string) => {
    const resources = await loadResources(code);
    i18n.addResourceBundle(code, "translation", resources, true, true);
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  };

  return (
    <div className="flex flex-col gap-3  mb-4">
      <h3 className=" text-blue-600 dark:text-[#868686] my-2 ml-5 text-[0.8rem] text-left ">🌍 Scegli la lingua</h3>
      {languages.map((lang) => (
        <label
          key={lang.code}
          className="flex items-center ml-[3rem] gap-3 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-[#2d2d2d] "
        >
          <input
            type="radio"
            name="language"
            value={lang.code}
            checked={currentLang.startsWith(lang.code)}
            onChange={() => handleChange(lang.code)}
            className="accent-blue-600 w-[1rem] h-[1rem] mt-2"
          />
          <span className="text-md dark:text-white">{lang.flag}</span>
          <span className="flex flex-col leading-tight ml-auto w-[7rem]">
            <span className="font-medium dark:text-white">{lang.native}</span>
            <span className="text-xs text-gray-400">{lang.english}</span>
          </span>
        </label>
      ))}
    </div>
  );
};

export default LanguageSettings;

