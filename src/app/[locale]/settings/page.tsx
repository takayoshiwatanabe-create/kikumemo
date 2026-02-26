import SettingsScreen from "./index";
import { Metadata } from "next";
import { translations, Language } from "@/i18n/translations";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const lang = params.locale;
  const t = (key: string, vars?: Record<string, string | number>) => {
    let text = translations[lang as Language]?.[key] || translations.en[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
      }
    }
    return text;
  };

  return {
    title: `${t("settings.title")} - ${t("header.appName")}`,
    description: t("settings.description"),
  };
}

export default function SettingsPage() {
  return <SettingsScreen />;
}
