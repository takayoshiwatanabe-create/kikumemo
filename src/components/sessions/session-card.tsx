"use client";

import React from "react";
import { motion } from "framer-motion";
import { RecordingSession } from "@/types";
import { useI18n } from "@/i18n";
import { translations } from "@/i18n/translations";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  session: RecordingSession;
  onClick: (sessionId: string) => void;
}

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

export default function SessionCard({ session, onClick }: SessionCardProps) {
  const { t, lang } = useI18n();

  const getStatusClass = (status: RecordingSession['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'processing':
        return 'text-blue-600 dark:text-blue-400 animate-pulse';
      case 'recording':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.button
      onClick={() => onClick(session.id)}
      className="block w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200 ease-in-out"
      variants={itemVariants}
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
        {session.title}
      </h2>
      <p className={cn("text-md", getStatusClass(session.status))}>
        {t(`session.status.${session.status}` as keyof typeof translations.en.session.status)}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        {new Date(session.createdAt).toLocaleDateString(lang)}
        {session.duration_seconds > 0 && (
          <span className="ml-2">
            ({Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s)
          </span>
        )}
      </p>
    </motion.button>
  );
}

