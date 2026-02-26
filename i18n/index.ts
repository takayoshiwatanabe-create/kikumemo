import * as Localization from "expo-localization";
import { translations, type Language } from "./translations";
import { useState, createContext, useContext, ReactNode } from "react";
import { useRouter, useSegments } from "expo-router";

const SUPPORTED_LANGUAGES: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];
const DEFAULT_LANGUAGE: Language = "ja";

function getDeviceLanguage(): Language {
  try {
    const locales = Localization.getLocales();
    const deviceLang = locales[0]?.languageCode ?? DEFAULT_LANGUAGE;
    if (SUPPORTED_LANGUAGES.includes(deviceLang as Language)) return deviceLang as Language;
    return DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

interface I18nContextType {
  lang: Language;
  isRTL: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLanguage: (newLang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const initialLang = (segments[0] as Language) || getDeviceLanguage();
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);

  const setLanguage = (newLang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) {
      console.warn(`Unsupported language: ${newLang}. Falling back to ${DEFAULT_LANGUAGE}.`);
      newLang = DEFAULT_LANGUAGE;
    }
    setCurrentLang(newLang);
    // Update the URL to reflect the new locale
    const currentPath = segments.join('/');
    const newPath = currentPath.replace(initialLang, newLang);
    router.replace(`/${newPath}`);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const dict = translations[currentLang] ?? translations[DEFAULT_LANGUAGE];
    let text = dict[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
      }
    }
    return text;
  };

  const isRTL = ["ar"].includes(currentLang);

  return (
    <I18nContext.Provider value={{ lang: currentLang, isRTL, t, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Re-export for direct use in non-component files if needed, but prefer useI18n
export const lang = getDeviceLanguage();
export const isRTL = ["ar"].includes(lang);
export const translate = (key: string, vars?: Record<string, string | number>): string => {
  const dict = translations[lang] ?? translations[DEFAULT_LANGUAGE];
  let text = dict[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
    }
  }
  return text;
};

