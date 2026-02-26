import { translations, type Language } from "./translations";
import { useState, createContext, useContext, ReactNode } from "react";
import { useRouter, useSegments } from "next/navigation"; // Changed from "expo-router"

const SUPPORTED_LANGUAGES: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];
const DEFAULT_LANGUAGE: Language = "ja";

function getDeviceLanguage(): Language {
  try {
    // For web, use navigator.language
    const deviceLang = navigator.language.split('-')[0] ?? DEFAULT_LANGUAGE;
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
  
  // Determine the initial language from the URL segment or device
  const urlLocale = segments[0];
  const initialLang = (urlLocale && SUPPORTED_LANGUAGES.includes(urlLocale as Language) ? urlLocale : getDeviceLanguage()) as Language;
  
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);

  const setLanguage = (newLang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) {
      console.warn(`Unsupported language: ${newLang}. Falling back to ${DEFAULT_LANGUAGE}.`);
      newLang = DEFAULT_LANGUAGE;
    }
    setCurrentLang(newLang);
    
    // Update the URL to reflect the new locale
    const currentPathSegments = [...segments];
    if (currentPathSegments.length > 0 && SUPPORTED_LANGUAGES.includes(currentPathSegments[0] as Language)) {
      currentPathSegments[0] = newLang;
    } else {
      // If for some reason the locale wasn't the first segment, prepend it
      currentPathSegments.unshift(newLang);
    }
    const newPath = currentPathSegments.join('/');
    // Ensure the path starts with a slash if it's not empty
    router.replace(`/${newPath.startsWith('/') ? newPath.substring(1) : newPath}`);
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
// The `isRTL` and `translate` exports here are based on the initial `lang` detection,
// which might not reflect changes made via `setLanguage` in a component.
// For dynamic language changes, `useI18n` should be preferred.
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

