"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { useRouter } from "next/navigation";
import { RecordingSession } from "@/types";
import { useSession } from "next-auth/react";
import { translations } from "@/i18n/translations";
import { motion } from "framer-motion";

export default function SessionsScreen() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${lang}/auth/login`);
      return;
    }

    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/sessions');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch sessions");
        }
        const data: RecordingSession[] = await response.json();
        setSessions(data);
      } catch (err: any) {
        console.error("Error fetching sessions:", err);
        setError(err.message || t("sessions.fetchError"));
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchSessions();
    }
  }, [status, lang, router, t]);

  const handleSessionClick = (sessionId: string) => {
    router.push(`/${lang}/sessions/${sessionId}`);
  };

  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500 text-center">{error}</p>
      </div>
    );
  }

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
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
          variants={itemVariants}
        >
          {t("sessions.title")}
        </motion.h1>
        {sessions.length === 0 ? (
          <motion.p
            className="text-lg text-gray-700 dark:text-gray-300 text-center mt-12"
            variants={itemVariants}
          >
            {t("sessions.noSessions")}
          </motion.p>
        ) : (
          <motion.div className="space-y-4" variants={containerVariants}>
            {sessions.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleSessionClick(item.id)}
                className="block w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200 ease-in-out"
                variants={itemVariants}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h2>
                <p className="text-md text-gray-600 dark:text-gray-400">
                  {t(`session.status.${item.status}` as keyof typeof translations.en.session.status)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(item.createdAt).toLocaleDateString(lang)}
                </p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
