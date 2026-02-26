"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { useRouter } from "next/navigation";
import { RecordingSession } from "@/types";
import { useSession } from "next-auth/react";
import { translations } from "@/i18n/translations";
import { Language } from "@/i18n";

const mockSessions: RecordingSession[] = [
  {
    id: "1",
    userId: "user1",
    title: "Project Kick-off Meeting",
    status: "completed",
    duration_seconds: 3600,
    language_code: "en",
    createdAt: new Date("2023-10-26T10:00:00Z"),
    updatedAt: new Date("2023-10-26T11:00:00Z"),
  },
  {
    id: "2",
    userId: "user1",
    title: "Weekly Sync",
    status: "processing",
    duration_seconds: 1800,
    language_code: "ja",
    createdAt: new Date("2023-10-25T14:30:00Z"),
    updatedAt: new Date("2023-10-25T14:45:00Z"),
  },
  {
    id: "3",
    userId: "user1",
    title: "Client Demo Feedback",
    status: "failed",
    duration_seconds: 1200,
    language_code: "es",
    createdAt: new Date("2023-10-24T09:00:00Z"),
    updatedAt: new Date("2023-10-24T09:10:00Z"),
  },
];

export default function SessionsScreen() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<RecordingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${lang}/auth/login`);
      return;
    }

    const fetchSessions = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSessions(mockSessions);
      setLoading(false);
    };

    if (status === "authenticated") {
      fetchSessions();
    }
  }, [status, lang, router]);

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {t("sessions.title")}
        </h1>
        {sessions.length === 0 ? (
          <p className="text-lg text-gray-700 dark:text-gray-300 text-center mt-12">
            {t("sessions.noSessions")}
          </p>
        ) : (
          <div className="space-y-4">
            {sessions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSessionClick(item.id)}
                className="block w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200 ease-in-out"
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
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

