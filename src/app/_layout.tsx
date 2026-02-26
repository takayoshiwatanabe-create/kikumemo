import React from "react";
import { redirect } from "next/navigation";
import { getDeviceLanguage } from "@/i18n";

// This is the root layout for the entire application.
// It wraps all other layouts and pages.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The root layout should not perform redirects directly as it's meant to wrap the entire application.
  // Redirection based on language should happen at the `app/page.tsx` level or a specific entry point.
  // The `[locale]/_layout.tsx` is responsible for setting the `lang` and `dir` attributes.
  // This `RootLayout` should provide a basic HTML structure that is then enhanced by `[locale]/_layout.tsx`.

  return (
    <html lang="en"> {/* Default to 'en' or a neutral language for the very root, overridden by [locale] */}
      <body>
        {children}
      </body>
    </html>
  );
}
