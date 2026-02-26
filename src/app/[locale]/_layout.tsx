"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "next-auth/react"; // Ensure SessionProvider is imported

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
