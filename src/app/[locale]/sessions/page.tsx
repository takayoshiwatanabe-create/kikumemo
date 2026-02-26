import SessionsScreen from "./index";
import { Metadata } from "next";
import { translations } from "@/i18n/translations";
import { Language } from "@/i18n"; // Import Language from i18n/index.ts

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
    title: `${t("sessions.title")} - ${t("header.appName")}`,
    description: t("sessions.description"),
  };
}

export default function SessionsPage() {
  return <SessionsScreen />;
}
