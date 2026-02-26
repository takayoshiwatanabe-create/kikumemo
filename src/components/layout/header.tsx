"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { MenuIcon, SettingsIcon, ListTodoIcon, MicIcon, LayoutDashboardIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store"; // Import useUIStore

interface HeaderProps {
  // onMenuPress: () => void; // Removed as it's handled by useUIStore
}

export function Header({}: HeaderProps) { // Removed onMenuPress from props
  const { t, lang } = useI18n();
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore(); // Use toggleSidebar from store

  const navItems = [
    { href: `/${lang}/dashboard`, icon: LayoutDashboardIcon, label: t("header.dashboard") },
    { href: `/${lang}/record`, icon: MicIcon, label: t("header.record") },
    { href: `/${lang}/sessions`, icon: ListTodoIcon, label: t("header.sessions") },
    { href: `/${lang}/settings`, icon: SettingsIcon, label: t("header.settings") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-4"
            onClick={toggleSidebar} // Use toggleSidebar
            aria-label={t("header.toggleSidebar")}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
          <Link href={`/${lang}/dashboard`} className="flex items-center space-x-2">
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              {t("header.appName")}
            </span>
          </Link>
        </div>
        <nav className="hidden lg:flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                pathname.startsWith(item.href)
                  ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-4">
          {/* User profile/auth buttons can go here */}
        </div>
      </div>
    </header>
  );
}


