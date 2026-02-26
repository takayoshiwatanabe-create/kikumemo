import React from "react";

// This is the root layout for the entire application.
// It wraps all other layouts and pages.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja"> {/* Default language for the root HTML tag, will be overridden by [locale]/_layout.tsx */}
      <body>
        {children}
      </body>
    </html>
  );
}
