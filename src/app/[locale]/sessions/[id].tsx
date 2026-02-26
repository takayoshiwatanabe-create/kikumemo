"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useI18n } from "@/i18n";
import { RecordingSession, AISummaryResponse, AITodoItem } from "@/types"; // Import AITodoItem
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { translations } from "@/i18n/translations";
import SummaryDisplay from "@/components/ai/summary-display";
import { motion } from "framer-motion";

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
          const aiSummaryResponse: AISummaryResponse = {
            summary: sessionDetails.ai_summary || "",
            keyPoints: [],
            todos: [],
            decisions: [],
            openIssues: [],
          };

          // Fetch AI outputs from the ai_outputs table
          const aiOutputsRes = await fetch(`/api/sessions/${id}/ai-outputs`);
          if (aiOutputsRes.ok) {
            const aiOutputsData = await aiOutputsRes.json();
            aiOutputsData.forEach((output: { type: string; content: string; }) => {
              try {
                const content = JSON.parse(output.content);
                if (output.type === 'key_points') aiSummaryResponse.keyPoints = content;
                if (output.type === 'todos') aiSummaryResponse.todos = content as AITodoItem[]; // Cast to AITodoItem[]
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
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-center text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-center text-xl text-red-500">{t("session.notFound")}</p>
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
      className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto max-w-4xl pb-12">
        <motion.h1
          className="mb-2 text-4xl font-bold text-gray-900 dark:text-white"
          variants={itemVariants}
        >
          {sessionData.title}
        </motion.h1>
        <motion.p
          className="mb-6 text-lg text-gray-600 dark:text-gray-400"
          variants={itemVariants}
        >
          {t(`session.status.${sessionData.status}` as keyof typeof translations.en.session.status)}
        </motion.p>

        {sessionData.transcript && (
          <motion.div
            className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
            variants={itemVariants}
          >
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">{t("session.transcript")}</h2>
            <p className="leading-relaxed text-gray-800 dark:text-gray-200">{sessionData.transcript}</p>
          </motion.div>
        )}

        {sessionData.user_notes && (
          <motion.div
            className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
            variants={itemVariants}
          >
            <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">{t("session.userNotes")}</h2>
            <p className="leading-relaxed text-gray-800 dark:text-gray-200">{sessionData.user_notes}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <SummaryDisplay summary={aiOutput} isLoading={sessionData.status === 'processing'} error={error} />
        </motion.div>
      </div>
    </motion.div>
  );
}

