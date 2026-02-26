import React from "react";
import { redirect } from "next/navigation"; // Changed from "expo-router" to "next/navigation"
import { getDeviceLanguage } from "@/i18n"; // Import the detected language

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // This file acts as the root layout for the entire application.
  // It should not perform redirects directly.
  // The redirection logic based on device language should be in `app/page.tsx` or `app/index.tsx`.
  // This layout simply provides the base HTML structure.
  return (
    <html lang="en"> {/* Default to 'en' or a neutral language for the very root HTML tag */}
      <body>
        {children}
      </body>
    </html>
  );
}
