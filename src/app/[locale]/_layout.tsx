"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useUIStore } from "@/stores/ui-store";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang, isRTL } = useI18n();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  return (
    <div className={cn("flex min-h-screen", isRTL ? "rtl" : "ltr")}>
      {/* Sidebar for large screens, always static here */}
      <Sidebar isOpen={false} onClose={() => {}} isStatic={true} />

      {/* Mobile Sidebar (overlay) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => toggleSidebar()} />

      <div className="flex flex-1 flex-col">
        <Header onMenuPress={() => toggleSidebar()} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
