"use client";

import React from "react";
import { useI18n } from "@/i18n";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Session } from "next-auth"; // Import Session type

export default function DashboardScreen() {
  const { t, lang, isRTL } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push(`/${lang}/auth/login`);
    return null;
  }

  // Ensure session.user is not null before accessing its properties
  const userName = (session?.user as Session['user'])?.name || "User";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: "easeOut",
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      className={`flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 dark:bg-gray-900 ${isRTL ? "rtl" : "ltr"}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
        variants={itemVariants}
      >
        {t("dashboard.title")}
      </motion.h1>
      <motion.p
        className="text-lg text-gray-700 dark:text-gray-300"
        variants={itemVariants}
      >
        {t("dashboard.welcomeMessage", { name: userName })}
      </motion.p>
      <motion.div className="mt-8 flex space-x-4" variants={itemVariants}>
        <Button
          onClick={() => router.push(`/${lang}/record`)}
          className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-700"
        >
          {t("dashboard.startNewRecording")}
        </Button>
        <Button
          onClick={() => router.push(`/${lang}/sessions`)}
          variant="outline"
          className="rounded-lg border-blue-600 px-6 py-3 text-lg font-semibold text-blue-600 shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
        >
          {t("dashboard.viewAllSessions")}
        </Button>
      </motion.div>
    </motion.div>
  );
}


