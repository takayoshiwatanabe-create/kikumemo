"use client";

import React from "react";
import { useI18n } from "@/i18n";

export default function DashboardScreen() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t("dashboard.title")}
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        {t("dashboard.welcomeMessage", { name: "User" })}
      </p>
      {/* Add dashboard components here */}
    </div>
  );
}

