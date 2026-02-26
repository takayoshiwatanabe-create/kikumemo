import React from "react";
// No direct redirect here. The root layout should not perform redirects.
// The redirection logic is handled in src/app/page.tsx.

// This is the root layout for the entire application.
// It wraps all other layouts and pages.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The `RootLayout` should provide a basic HTML structure that is then enhanced by `[locale]/_layout.tsx`.
  // The `lang` attribute is set to a default here, but will be overridden by the `[locale]/_layout.tsx`
  // which sets the correct language based on the URL segment.
  return (
    <html lang="en"> {/* Default to 'en' or a neutral language for the very root, overridden by [locale] */}
      <body>
        {children}
      </body>
    </html>
  );
}
