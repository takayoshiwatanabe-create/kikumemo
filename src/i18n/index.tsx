"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { translations } from "./translations";
import { headers } from "next/headers";

export type Language =
  | "ja"
  | "en"
  | "zh"
  | "ko"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "ar"
  | "hi";

interface I18nContextType {
  lang: Language;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLanguage: (newLang: Language) => void;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale: Language;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [lang, setLang] = useState<Language>(initialLocale);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(lang === "ar");
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let text =
        translations[lang]?.[key as keyof typeof translations.en] ||
        translations.en[key as keyof typeof translations.en] ||
        key;

      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
        }
      }
      return text;
    },
    [lang]
  );

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t, setLanguage, isRTL }}>
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

export function getDeviceLanguage(requestHeaders: Headers): Language {
  const acceptLanguage = requestHeaders.get("accept-language");
  if (acceptLanguage) {
    const preferredLanguage = acceptLanguage.split(",")[0].split("-")[0];
    const supportedLanguages: Language[] = [
      "ja",
      "en",
      "zh",
      "ko",
      "es",
      "fr",
      "de",
      "pt",
      "ar",
      "hi",
    ];
    if (supportedLanguages.includes(preferredLanguage as Language)) {
      return preferredLanguage as Language;
    }
  }
  return "ja"; // Default language
}


