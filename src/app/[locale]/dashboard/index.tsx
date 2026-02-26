"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth"; // Import Session type

export default function DashboardScreen() {
  const { t, lang } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Redirect to login page if not authenticated
    router.push(`/${lang}/auth/login`);
    return null;
  }

  // Ensure session.user is not null before accessing its properties
  // The Session type already includes 'user' as non-nullable if `status === "authenticated"`.
  // No need for explicit casting or null checks if status is 'authenticated'.
  const userName = (session as Session)?.user?.name || "User";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t("dashboard.title")}
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        {t("dashboard.welcomeMessage", { name: userName })}
      </p>
      <div className="mt-8 flex space-x-4">
        <Button
          onClick={() => router.push(`/${lang}/record`)}
          className="px-6 py-3 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300 ease-in-out"
        >
          {t("dashboard.startNewRecording")}
        </Button>
        <Button
          onClick={() => router.push(`/${lang}/sessions`)}
          variant="outline"
          className="px-6 py-3 text-lg font-semibold rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 shadow-lg transition-all duration-300 ease-in-out"
        >
          {t("dashboard.viewAllSessions")}
        </Button>
      </div>
      {/* Add dashboard components here */}
    </div>
  );
}
