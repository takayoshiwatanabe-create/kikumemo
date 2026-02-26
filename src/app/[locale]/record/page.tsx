import RecordScreen from "./index";
import { Metadata } from "next";
import { getDeviceLanguage } from "@/i18n";
import { headers } from "next/headers";
import { translations, Language } from "@/i18n/translations";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const lang = params.locale; // Use locale from params for server-side metadata generation
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
    title: `${t("record.title")} - ${t("header.appName")}`,
    description: t("record.instructions"),
  };
}

export default function RecordPage() {
  return <RecordScreen />;
}
