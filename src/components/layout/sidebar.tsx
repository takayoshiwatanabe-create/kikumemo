"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { XIcon, LayoutDashboardIcon, MicIcon, ListTodoIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store"; // Import useUIStore

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isStatic?: boolean; // New prop to indicate if it's a static sidebar (for large screens)
}

export default function Sidebar({ isOpen, onClose, isStatic = false }: SidebarProps) {
  const { t, lang } = useI18n();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore(); // Use sidebarOpen and toggleSidebar from store

  const navItems = [
    { href: `/${lang}/dashboard`, icon: LayoutDashboardIcon, label: t("header.dashboard") },
    { href: `/${lang}/record`, icon: MicIcon, label: t("header.record") },
    { href: `/${lang}/sessions`, icon: ListTodoIcon, label: t("header.sessions") },
    { href: `/${lang}/settings`, icon: SettingsIcon, label: t("header.settings") },
  ];

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  };

  if (isStatic) {
    return (
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 dark:lg:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <div className="mb-8">
          <Link href={`/${lang}/dashboard`} className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-gray-900 dark:text-white">
              {t("header.appName")}
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                pathname.startsWith(item.href)
                  ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  // Mobile sidebar (overlay)
  return (
    <AnimatePresence>
      {sidebarOpen && ( // Use sidebarOpen from store
        <motion.aside
          className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col lg:hidden"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex items-center justify-between mb-8">
            <Link href={`/${lang}/dashboard`} className="flex items-center space-x-2">
              <span className="font-bold text-2xl text-gray-900 dark:text-white">
                {t("header.appName")}
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label={t("header.closeSidebar")}>
              <XIcon className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                  pathname.startsWith(item.href)
                    ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                )}
                onClick={toggleSidebar} // Close sidebar on navigation
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
