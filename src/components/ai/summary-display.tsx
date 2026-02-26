"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";
import { AISummaryResponse } from "@/types";
import KeyPointsList from "./key-points-list";
import TodoList from "./todo-list";
import DecisionsList from "./decisions-list";
import OpenIssuesList from "./open-issues-list";
import { Language } from "@/i18n";

interface SummaryDisplayProps {
  summary: AISummaryResponse | null;
  isLoading: boolean;
  error?: string | null; // Allow null for error
}

const ThinkingVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export default function SummaryDisplay({ summary, isLoading, error }: SummaryDisplayProps) {
  const { t, lang, isRTL } = useI18n(); // Destructure isRTL

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        initial="initial"
        animate="animate"
        variants={ThinkingVariants}
      >
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-blue-600 dark:text-blue-400">
          {t("record.processingAudio")}...
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-100 dark:bg-red-900 rounded-lg shadow-md text-red-800 dark:text-red-200">
        <h2 className="text-xl font-semibold mb-2">{t("common.error")}</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!summary || !summary.summary) { // Check for summary.summary as well
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-700 dark:text-gray-300">
        <p>{t("session.noSummaryAvailable")}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 ${isRTL ? "text-right" : "text-left"}`}>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t("session.aiSummary")}</h2>
      <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">{summary.summary}</p>

      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.keyPoints")}</h3>
          <KeyPointsList points={summary.keyPoints} />
        </div>
      )}

      {summary.todos && summary.todos.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.todos")}</h3>
          <TodoList todos={summary.todos} lang={lang as Language} />
        </div>
      )}

      {summary.decisions && summary.decisions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.decisions")}</h3>
          <DecisionsList decisions={summary.decisions} />
        </div>
      )}

      {summary.openIssues && summary.openIssues.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t("session.openIssues")}</h3>
          <OpenIssuesList issues={summary.openIssues} />
        </div>
      )}
    </div>
  );
}


