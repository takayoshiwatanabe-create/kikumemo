import { I18nProvider, getDeviceLanguage } from "@/i18n";
import { headers } from "next/headers";
import "./globals.css";
import { SessionProvider } from "./session-provider"; // Corrected import path for SessionProvider

// This is the root layout for the entire application.
// It wraps all other layouts and pages.
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
