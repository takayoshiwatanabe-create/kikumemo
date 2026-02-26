import DashboardScreen from "./index";
import { Metadata } from "next";
import { getDeviceLanguage } from "@/i18n"; // Import getDeviceLanguage
import { headers } from "next/headers"; // Import headers for server-side language detection
import { translations } from "@/i18n/translations"; // Import translations to get localized metadata
import { Language } from "@/i18n/translations"; // Import Language type

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const lang = params.locale; // Use locale from params for server-side metadata generation
  // Ensure lang is a valid Language type for indexing translations
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
    title: `${t("dashboard.title")} - ${t("header.appName")}`,
    description: t("dashboard.welcomeMessage", { name: "" }).replace(", !", "."), // Remove name placeholder for description
  };
}

export default function DashboardPage() {
  return <DashboardScreen />;
}
