import SessionDetailScreen from "../[id]";
import { Metadata } from "next";
import { translations } from "@/i18n/translations";
import { Language } from "@/i18n";

export async function generateMetadata({ params }: { params: { id: string, locale: string } }): Promise<Metadata> {
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

  const sessionTitle = `${t("sessions.session")} ${params.id}`;
  return {
    title: `${sessionTitle} - ${t("header.appName")}`,
    description: `${t("session.detailsAndSummary")} ${params.id}.`,
  };
}

export default function SessionDetailPage() {
  return <SessionDetailScreen />;
}
