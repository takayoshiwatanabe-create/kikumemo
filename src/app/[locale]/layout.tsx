import { I18nProvider } from "@/i18n";
import "../globals.css";
import type { Metadata } from "next";
import { Language, translations } from "@/i18n/translations"; // Import Language and translations
import LocaleLayoutClient from "./_layout"; // Import the client component

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const lang = params.locale;
  const t = (key: string, vars?: Record<string, string | number>) => {
    let text = translations[lang as Language]?.[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
      }
    }
    return text;
  };

  return {
    title: `${t("header.appName")} - ${t("dashboard.title")}`, // Default to dashboard title
    description: t("dashboard.welcomeMessage", { name: "" }).replace(", !", "."), // Default to dashboard welcome message
  };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // The locale is now passed via params, no need to re-detect from headers here.
  // The root layout (src/app/layout.tsx) handles initial detection and redirect.
  // This layout is for a specific locale.

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* SessionProvider is now handled in src/app/[locale]/_layout.tsx */}
        <I18nProvider initialLocale={locale as Language}>
          <LocaleLayoutClient>{children}</LocaleLayoutClient>
        </I18nProvider>
      </body>
    </html>
  );
}

