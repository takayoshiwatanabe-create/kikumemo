"use client";

import React, { useState } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import Sidebar from "./sidebar"; // Import the Sidebar component

export default function Header() {
  const { t, isRTL } = useI18n();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 dark:bg-gray-800 dark:border-gray-700 shadow-sm",
          isRTL ? "flex-row-reverse" : ""
        )}
      >
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t("common.toggleSidebar")}
        >
          {/* Hamburger Icon */}
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("header.appName")}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* User avatar/profile link, notifications, etc. */}
          <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {/* Placeholder for user avatar */}
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
