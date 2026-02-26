import SessionDetailScreen from "../[id]";
import { Metadata } from "next";
import { getDeviceLanguage } from "@/i18n";
import { headers } from "next/headers";
import { translations, Language } from "@/i18n/translations";

// Dynamic metadata for session detail page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
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

  // In a real app, you'd fetch the session title from a database based on params.id
  const sessionTitle = `${t("sessions.session")} ${params.id}`; // Placeholder
  return {
    title: `${sessionTitle} - ${t("header.appName")}`,
    description: `${t("session.detailsAndSummary")} ${params.id}.`,
  };
}

export default function SessionDetailPage() {
  return <SessionDetailScreen />;
}
