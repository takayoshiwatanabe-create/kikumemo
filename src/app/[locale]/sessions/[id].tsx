"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useI18n } from "@/i18n";
import { RecordingSession, AISummaryResponse } from "@/types";
import { useSession } from "next-auth/react"; // Import useSession
import { useRouter } from "next/navigation"; // Import useRouter
import { Language } from "@/i18n"; // Import Language from i18n/index.ts
import { translations } from "@/i18n/translations"; // Import translations for type assertion
import KeyPointsList from "@/components/ai/key-points-list"; // Import KeyPointsList
import TodoList from "@/components/ai/todo-list"; // Import TodoList
import DecisionsList from "@/components/ai/decisions-list"; // Import DecisionsList
import OpenIssuesList from "@/components/ai/open-issues-list"; // Import OpenIssuesList

const mockSessionDetail: RecordingSession = {
  id: "1",
  userId: "user1",
  title: "Project Kick-off Meeting",
  status: "completed",
  audio_file_path: "/path/to/audio.opus",
  transcript: "Okay, so welcome everyone to the project kick-off meeting for the new KikuMemo AI transcription service. Our main goal is to provide a seamless experience for users to record meetings and get instant, accurate summaries. John, could you start with the technical overview?",
  user_notes: "Key points: seamless experience, instant summaries. Action: John to cover tech.",
  ai_summary: "The project kick-off meeting for KikuMemo AI transcription service focused on providing a seamless user experience with instant, accurate summaries. John is assigned to present the technical overview.",
  duration_seconds: 3600,
  language_code: "en",
  createdAt: new Date("2023-10-26T10:00:00Z"),
  updatedAt: new Date("2023-10-26T11:00:00Z"),
};

const mockAISummary: AISummaryResponse = {
  summary: "The project kick-off meeting for KikuMemo AI transcription service focused on providing a seamless user experience with instant, accurate summaries. John is assigned to present the technical overview.",
  keyPoints: [
    "KikuMemo AI transcription service kick-off.",
    "Mission: seamless user experience, instant accurate summaries.",
    "John to provide technical overview."
  ],
  todos: [
    { assignee: "John", task: "Prepare technical overview presentation", priority: "high" },
    { assignee: "Team", task: "Review initial design mockups", priority: "medium", deadline: "2023-11-01" }
  ],
  decisions: [
    "Project name confirmed as KikuMemo.",
    "Focus on user experience and summary accuracy."
  ],
  openIssues: [
    "Finalize API integration strategy for Whisper/GPT-4.",
    "Define detailed UI/UX for real-time transcription."
  ]
};

export default function SessionDetailScreen() {
  const params = useParams();
  // Ensure `id` is always a string, even if `params.id` is an array (though it shouldn't be for a single dynamic segment).
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { t, lang } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sessionData, setSessionData] = useState<RecordingSession | null>(null);
  const [aiOutput, setAiOutput] = useState<AISummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${lang}/auth/login`);
      return;
    }

    const fetchSessionData = async () => {
      setLoading(true);
      // In a real app, you'd fetch from your API:
      // const response = await fetch(`/api/sessions/${id}`);
      // const data = await response.json();
      // setSessionData(data.session);
      // setAiOutput(data.aiOutput);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSessionData(mockSessionDetail);
      setAiOutput(mockAISummary);
      setLoading(false);
    };

    if (id && status === "authenticated") {
      fetchSessionData();
    }
  }, [id, status, lang, router]);

  if (loading || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500 text-center">{t("session.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto pb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{sessionData.title}</h1>
        {/* Using a type assertion for the translation key to ensure it matches the i18n structure */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t(`session.status.${sessionData.status}` as keyof typeof translations.en.session.status)}</p>

        {sessionData.transcript && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t("session.transcript")}</h2>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{sessionData.transcript}</p>
          </div>
        )}

        {sessionData.user_notes && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t("session.userNotes")}</h2>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{sessionData.user_notes}</p>
          </div>
        )}

        {aiOutput && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t("session.aiSummary")}</h2>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">{aiOutput.summary}</p>

            {aiOutput.keyPoints && aiOutput.keyPoints.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.keyPoints")}</h3>
                <KeyPointsList points={aiOutput.keyPoints} />
              </div>
            )}

            {aiOutput.todos && aiOutput.todos.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.todos")}</h3>
                <TodoList todos={aiOutput.todos} lang={lang as Language} />
              </div>
            )}

            {aiOutput.decisions && aiOutput.decisions.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.decisions")}</h3>
                <DecisionsList decisions={aiOutput.decisions} />
              </div>
            )}

            {aiOutput.openIssues && aiOutput.openIssues.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.openIssues")}</h3>
                <OpenIssuesList issues={aiOutput.openIssues} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
