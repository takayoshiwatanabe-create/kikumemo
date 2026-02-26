"use client"; // This module uses client-side hooks like useState, useContext, useEffect, useRouter, useSelectedLayoutSegments

import { translations, type Language } from "./translations";
import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { useRouter, useSelectedLayoutSegments } from "next/navigation"; // Changed from useSegments to useSelectedLayoutSegments for better segment handling

const SUPPORTED_LANGUAGES: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];
const DEFAULT_LANGUAGE: Language = "ja";

export function getDeviceLanguage(): Language {
  // This function is for client-side detection.
  // On the server, the locale should be determined from the URL or headers.
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE; // Default on server
  }
  const deviceLang = navigator.language.split('-')[0] as Language;
  if (SUPPORTED_LANGUAGES.includes(deviceLang)) return deviceLang;
  return DEFAULT_LANGUAGE;
}

interface I18nContextType {
  lang: Language;
  isRTL: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLanguage: (newLang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale: string; // Passed from the layout, e.g., `params.locale`
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const router = useRouter();
  const segments = useSelectedLayoutSegments(); // Use this to get segments after the locale

  // The initial language is now passed as a prop from the layout, which gets it from the URL.
  // This ensures server-side rendering has the correct locale from the start.
  const [currentLang, setCurrentLang] = useState<Language>(initialLocale as Language);

  // Update currentLang if initialLocale changes (e.g., if the URL locale changes)
  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(initialLocale as Language)) {
      setCurrentLang(initialLocale as Language);
    } else {
      setCurrentLang(DEFAULT_LANGUAGE);
    }
  }, [initialLocale]);

  const setLanguage = (newLang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) {
      console.warn(`Unsupported language: ${newLang}. Falling back to ${DEFAULT_LANGUAGE}.`);
      newLang = DEFAULT_LANGUAGE;
    }
    
    // Construct the new path with the updated locale
    // `segments` here would be ['dashboard', 'record', 'sessions', etc.]
    // The first segment (locale) is handled by the `initialLocale` prop and the layout structure.
    const pathWithoutLocale = segments.join('/');
    const newPath = `/${newLang}${pathWithoutLocale ? '/' + pathWithoutLocale : ''}`;
    
    router.replace(newPath); // Use router.replace to change the URL
    setCurrentLang(newLang); // Update local state immediately for responsiveness
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

// The `lang`, `isRTL`, and `translate` exports here are for initial server-side detection
// or for use in non-React contexts where hooks cannot be used.
// For dynamic language changes in components, `useI18n` is required.
export const lang = getDeviceLanguage(); // This will only get the client-side device language once.
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
