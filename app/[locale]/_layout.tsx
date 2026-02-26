"use client"; // This component uses client-side hooks like useEffect and useI18n

import React from "react";
import { I18nProvider } from "@/i18n"; // Removed useI18n as it's not used directly in this file
import { dir } from "i18next"; // Import dir from i18next
import { Language } from "@/i18n/translations"; // Import Language type
import Header from "@/components/layout/header"; // Import Header
import Sidebar from "@/components/layout/sidebar"; // Import Sidebar for large screens

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
    <html lang={currentLocale} dir={dir(currentLocale)} suppressHydrationWarning>
      <body>
        <I18nProvider initialLocale={currentLocale}>
          <div className="flex min-h-screen flex-col lg:flex-row">
            {" "}
            {/* Added lg:flex-row for sidebar layout */}
            <Sidebar isOpen={false} onClose={() => {}} isStatic={true} />{" "}
            {/* Sidebar for large screens */}
            <div className="flex flex-1 flex-col">
              <Header /> {/* Add the Header component here */}
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
