import SettingsScreen from "./index";
import { Metadata } from "next";
import { getDeviceLanguage } from "@/i18n";
import { headers } from "next/headers";
import { translations, Language } from "@/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = headers();
  const lang = getDeviceLanguage(requestHeaders);
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
