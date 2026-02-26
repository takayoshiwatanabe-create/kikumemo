"use client";

import { translations, type Language } from "./translations";
import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import { useRouter, useSelectedLayoutSegments } from "next/navigation";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
// Removed `headers` import here because it's a server-only function and causes issues in client components.
// The `getDeviceLanguage` function will now only perform client-side detection when called in a client context.

const SUPPORTED_LANGUAGES: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];
const DEFAULT_LANGUAGE: Language = "ja";

// This function is for client-side detection.
// For server-side detection, it should be called in a server component/route and passed the headers.
export function getDeviceLanguage(requestHeaders?: Headers): Language {
  let languages: string[] = [];

  if (typeof window !== 'undefined' && window.navigator.language) {
    // Client-side detection
    languages = [window.navigator.language];
  } else if (requestHeaders) {
    // Server-side detection if headers are provided (e.g., from a Next.js server component)
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
  initialLocale: Language; // Passed from the layout, e.g., `params.locale`
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const router = useRouter();
  const allSegments = useSelectedLayoutSegments();

  const [currentLang, setCurrentLang] = useState<Language>(initialLocale);

  // Update currentLang if initialLocale changes (e.g., if the URL locale changes)
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

    // Construct the new path with the updated locale
    // `allSegments` already includes the locale at the first position.
    // We need to replace the first segment with `newLang` and keep the rest.
    // The `allSegments` array does not include the initial locale segment itself.
    // It only contains segments *after* the locale.
    // So, if the path is /en/dashboard, allSegments will be ['dashboard'].
    // We need to prepend the newLang to these segments.
    const newPathSegments = [newLang, ...allSegments];
    const newPath = `/${newPathSegments.join('/')}`;

    router.replace(newPath); // Use router.replace to change the URL
    setCurrentLang(newLang); // Update local state immediately for responsiveness
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const dict = translations[currentLang] ?? translations[DEFAULT_LANGUAGE];
    let text = (dict as Record<string, string>)[key] ?? (translations[DEFAULT_LANGUAGE] as Record<string, string>)[key] ?? key;
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
