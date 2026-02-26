"use client";

import { translations, type Language } from "./translations";
import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const SUPPORTED_LANGUAGES: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];
const DEFAULT_LANGUAGE: Language = "ja";

export function getDeviceLanguage(requestHeaders?: Headers): Language {
  let languages: string[] = [];

  if (typeof window !== 'undefined' && window.navigator.language) {
    languages = [window.navigator.language];
  } else if (requestHeaders) {
    const acceptLanguage = requestHeaders.get('accept-language');
    if (acceptLanguage) {
      languages = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages();
    }
  }

  const locale = match(languages, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE);
  return locale as Language;
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
  initialLocale: Language;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const router = useRouter();
  const allSegments = useSelectedLayoutSegments();

  const [currentLang, setCurrentLang] = useState<Language>(initialLocale);

  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(initialLocale)) {
      setCurrentLang(initialLocale);
    } else {
      setCurrentLang(DEFAULT_LANGUAGE);
    }
  }, [initialLocale]);

  const setLanguage = (newLang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) {
      console.warn(`Unsupported language: ${newLang}. Falling back to ${DEFAULT_LANGUAGE}.`);
      newLang = DEFAULT_LANGUAGE;
    }

    const newPathSegments = [newLang, ...allSegments];
    const newPath = `/${newPathSegments.join('/')}`;

    router.replace(newPath);
    setCurrentLang(newLang);
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
