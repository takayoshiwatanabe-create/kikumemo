"use client";

import { useI18n } from "@/i18n";
import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";

// This is the layout for the locale-specific routes.
// It wraps all pages within a specific locale (e.g., /en, /ja).
export default function LocaleLayout({ children }: { children: React.ReactNode }) { // Add children prop
  const { lang, isRTL } = useI18n();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Ensure the HTML element's lang and dir attributes are updated
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  return (
    <SessionProvider>
      <div className={cn("flex min-h-screen flex-col lg:flex-row", isRTL ? "rtl" : "ltr")}>
        {/* Sidebar for large screens, always static here */}
        <Sidebar isOpen={false} onClose={() => {}} isStatic={true} />
        <div className="flex flex-1 flex-col">
          <Header onMenuPress={toggleSidebar} />
          <main className="flex-1">
            {children} {/* Render children here */}
          </main>
        </div>
        {/* Mobile sidebar, conditionally rendered */}
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} isStatic={false} />
      </div>
    </SessionProvider>
  );
}
