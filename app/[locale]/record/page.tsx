import RecordScreen from "./index";
import { Metadata } from "next"; // Import Metadata
import { translations, Language } from "@/i18n/translations"; // Import translations and Language type

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
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

export default async function RecordPage() {
  return <RecordScreen />;
}
