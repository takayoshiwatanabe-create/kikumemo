"use client"; // This component uses client-side hooks like useEffect and useI18n

import React, { useEffect } from "react";
import { I18nProvider, useI18n } from "@/i18n";
import { dir } from "i18next"; // Import dir from i18next
import { Language } from "@/i18n/translations"; // Import Language type

// This is a root layout for the `[locale]` segment.
// It will receive `children` as props, which will be the content of the nested routes.

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

// Define supported languages for the layout
const SUPPORTED_LANGUAGES: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // The locale is available in `params.locale` from the Next.js App Router.
  // We pass this to the I18nProvider to initialize the language.
  // On the server, `getDeviceLanguage` might not work as expected, so `params.locale` is crucial.

  // Ensure the locale is one of the supported languages, otherwise default
  const currentLocale: Language = SUPPORTED_LANGUAGES.includes(params.locale as Language) ? (params.locale as Language) : "ja";

  return (
    <html lang={currentLocale} dir={dir(currentLocale)}>
      <body>
        <I18nProvider initialLocale={currentLocale}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
