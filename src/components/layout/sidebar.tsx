"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Assuming cn utility is available

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isStatic?: boolean; // New prop to indicate if the sidebar should be static (for large screens)
}

export default function Sidebar({ isOpen, onClose, isStatic = false }: SidebarProps) {
  const { t, lang, isRTL } = useI18n();
  const router = useRouter();

  const navItems = [
    { name: t("dashboard.title"), href: `/${lang}/dashboard` },
    { name: t("record.title"), href: `/${lang}/record` },
    { name: t("sessions.title"), href: `/${lang}/sessions` },
    { name: t("settings.title"), href: `/${lang}/settings` },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {!isStatic && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
          isRTL
            ? "right-0 border-r border-gray-200 dark:border-gray-700"
            : "left-0 border-l border-gray-200 dark:border-gray-700",
          // Conditional classes for mobile sidebar
          !isStatic &&
            (isOpen
              ? "translate-x-0"
              : isRTL
              ? "translate-x-full"
              : "-translate-x-full"),
          // Classes for static sidebar on large screens
          isStatic &&
            "hidden lg:block lg:relative lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-200 dark:lg:border-gray-700"
        )}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            キクメモ
          </h2>
          <nav>
            <ul className="space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <a
                      className="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      onClick={onClose} // Close sidebar on navigation
                    >
                      {item.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}


