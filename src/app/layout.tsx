import { I18nProvider, getDeviceLanguage } from "@/i18n";
import { headers } from "next/headers";
import "./globals.css";
import { SessionProvider } from "./session-provider";
import type { Metadata } from "next";

// This is the root layout for the entire application.
// It wraps all other layouts and pages.

export const metadata: Metadata = {
  title: "キクメモ (KikuMemo) - AI議事録生成サービス",
  description: "「書く」を邪魔せず、「記憶」を拡張するAI議事録生成サービス",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Determine the initial locale on the server for the root layout
  const requestHeaders = headers();
  const initialLocale = getDeviceLanguage(requestHeaders);

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body>
        <SessionProvider>
          <I18nProvider initialLocale={initialLocale}>
            {children}
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
