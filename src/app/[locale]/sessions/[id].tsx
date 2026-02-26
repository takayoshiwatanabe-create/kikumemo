"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useI18n } from "@/i18n";
import { RecordingSession, AISummaryResponse } from "@/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Language } from "@/i18n";
import { translations } from "@/i18n/translations";
import SummaryDisplay from "@/components/ai/summary-display"; // Import SummaryDisplay

// Mock data for development/testing
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
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { t, lang } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [sessionData, setSessionData] = useState<RecordingSession | null>(null);
  const [aiOutput, setAiOutput] = useState<AISummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${lang}/auth/login`);
      return;
    }

    const fetchSessionData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch session details
        const sessionRes = await fetch(`/api/sessions/${id}/status`);
        if (!sessionRes.ok) {
          const errorData = await sessionRes.json();
          throw new Error(errorData.message || "Failed to fetch session details");
        }
        const sessionDetails: RecordingSession = await sessionRes.json();
        setSessionData(sessionDetails);

        // If session is completed, fetch AI outputs
        if (sessionDetails.status === 'completed') {
          // In a real app, you'd fetch AI outputs from /api/ai/outputs?sessionId=id
          // For now, we use the ai_summary from sessionDetails and mock other parts
          const aiSummaryResponse: AISummaryResponse = {
            summary: sessionDetails.ai_summary || "",
            keyPoints: [], // These would be fetched from ai_outputs table
            todos: [],
            decisions: [],
            openIssues: [],
          };

          // Simulate fetching AI outputs from the ai_outputs table
          const aiOutputsRes = await fetch(`/api/sessions/${id}/ai-outputs`); // New API endpoint needed
          if (aiOutputsRes.ok) {
            const aiOutputsData = await aiOutputsRes.json();
            aiOutputsData.forEach((output: { type: string; content: string; }) => {
              try {
                const content = JSON.parse(output.content);
                if (output.type === 'key_points') aiSummaryResponse.keyPoints = content;
                if (output.type === 'todos') aiSummaryResponse.todos = content;
                if (output.type === 'decisions') aiSummaryResponse.decisions = content;
                if (output.type === 'open_issues') aiSummaryResponse.openIssues = content;
              } catch (parseError) {
                console.warn(`Failed to parse AI output content for type ${output.type}:`, output.content);
              }
            });
          } else {
            console.warn("Failed to fetch detailed AI outputs. Using session's ai_summary only.");
          }

          setAiOutput(aiSummaryResponse);
        } else {
          setAiOutput(null); // No AI output if not completed
        }

      } catch (err: any) {
        console.error("Error fetching session data:", err);
        setError(err.message || t("session.fetchError"));
        setSessionData(null);
        setAiOutput(null);
      } finally {
        setLoading(false);
      }
    };

    if (id && status === "authenticated") {
      fetchSessionData();
    }
  }, [id, status, lang, router, t]);

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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-red-500 text-center">{error}</p>
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

        <SummaryDisplay summary={aiOutput} isLoading={sessionData.status === 'processing'} error={error} />
      </div>
    </div>
  );
}

