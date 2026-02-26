import React from "react";
import { I18nProvider } from "@/i18n";
import { dir } from "i18next";
import { Language } from "@/i18n/translations";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

// Define supported languages for the layout
const SUPPORTED_LANGUAGES: Language[] = ["ja", "en", "zh", "ko", "es", "fr", "de", "pt", "ar", "hi"];

// This layout wraps all pages within a specific locale.
// It receives the locale from the Next.js dynamic route segment.
export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure the locale is one of the supported languages, otherwise default
  // The `params.locale` should always be one of the supported languages due to Next.js i18n routing configuration.
  // However, a fallback is good practice.
  const currentLocale: Language = SUPPORTED_LANGUAGES.includes(locale as Language) ? (locale as Language) : "ja";

  return (
    <html lang={currentLocale} dir={dir(currentLocale)}>
      <body>
        <I18nProvider initialLocale={currentLocale}>
          <div className="flex min-h-screen flex-col lg:flex-row">
            {" "}
            {/* Added lg:flex-row for sidebar layout */}
            {/* Sidebar for large screens, always static here */}
            <Sidebar isOpen={false} onClose={() => {}} isStatic={true} />
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
