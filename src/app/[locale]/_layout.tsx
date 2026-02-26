"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
// SessionProvider should wrap the entire app in src/app/layout.tsx, not here.
// The import for SessionProvider is correctly placed in src/app/layout.tsx.
// This line should be removed.

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang, isRTL } = useI18n();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  return (
    <div className={cn("flex min-h-screen flex-col lg:flex-row", isRTL ? "rtl" : "ltr")}>
      {/* Sidebar for large screens, always static here */}
      {/* The CLAUDE.md spec does not explicitly define a static vs mobile sidebar,
          but the current implementation implies a responsive design.
          The `Sidebar` component itself should handle its responsiveness.
          For now, keeping the current structure but noting it could be simplified
          if the Sidebar component is fully responsive internally. */}
      <Sidebar isOpen={false} onClose={() => {}} isStatic={true} />

      {/* Mobile Sidebar (overlay) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col">
        <Header onMenuPress={() => setIsSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
