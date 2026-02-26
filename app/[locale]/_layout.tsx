// This file is intended for Next.js App Router, not Expo Router.
// React Native components like `Stack`, `StatusBar`, `View`, `StyleSheet` are not directly compatible.
// For Next.js, layout files typically return React components that wrap children.
// The i18n provider should wrap the entire application.

"use client"; // This component uses client-side hooks like useEffect and useI18n

import React, { useEffect } from "react";
import { I18nProvider, useI18n } from "@/i18n";
// No direct import for `dir` from `i18next` needed here, as `dir` is set on `html` tag.
// `headers` from `next/headers` is typically used in server components,
// but this layout is a client component due to `useEffect` and `useI18n` in `LocaleAwareWrapper`.
// The locale is passed via `params`.

// This is a root layout for the `[locale]` segment.
// It will receive `children` as props, which will be the content of the nested routes.

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // The locale is available in `params.locale` from the Next.js App Router.
  // We pass this to the I18nProvider to initialize the language.
  // On the server, `getDeviceLanguage` might not work as expected, so `params.locale` is crucial.

  // The `I18nProvider` will handle setting the language based on the URL segment.
  // We can also set the `dir` attribute on the `html` tag for RTL support.
  const isRTL = ["ar"].includes(params.locale);

  return (
    <html lang={params.locale} dir={isRTL ? "rtl" : "ltr"}>
      <body>
        <I18nProvider initialLocale={params.locale}>
          <LocaleAwareWrapper>{children}</LocaleAwareWrapper>
        </I18nProvider>
      </body>
    </html>
  );
}

// This component is a client component to use `useI18n` hook.
function LocaleAwareWrapper({ children }: { children: React.ReactNode }) {
  const { isRTL } = useI18n();

  useEffect(() => {
    // This effect can be used for client-side adjustments if needed,
    // e.g., setting a class on body or root div.
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [isRTL]);

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      {/* This is where the actual page content will be rendered */}
      {children}
    </div>
  );
}
