"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n";

interface RealtimeTranscriptProps {
  transcript: string;
  isRecording: boolean;
  isProcessing: boolean;
}

const TypewriterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.5,
    },
  },
};

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

export default function RealtimeTranscript({
  transcript,
  isRecording,
  isProcessing,
}: RealtimeTranscriptProps) {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const renderText = (text: string) => {
    return text.split("").map((char, i) => (
      <motion.span key={i} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        {char}
      </motion.span>
    ));
  };

  return (
    <div className="w-full max-w-2xl h-64 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 overflow-y-auto border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {t("record.realtimeTranscript")}
      </h3>
      <div
        ref={scrollRef}
        className="text-gray-800 dark:text-gray-200 text-base leading-relaxed h-48 overflow-y-auto custom-scrollbar"
      >
        {isRecording && transcript.length === 0 && (
          <motion.p
            className="text-gray-500 dark:text-gray-400 italic"
            initial="initial"
            animate="animate"
            variants={ThinkingVariants}
          >
            {t("record.listening")}...
          </motion.p>
        )}
        {transcript.length > 0 && (
          <motion.p
            className="whitespace-pre-wrap"
            variants={TypewriterVariants}
            initial="hidden"
            animate="visible"
          >
            {renderText(transcript)}
          </motion.p>
        )}
        {isProcessing && !isRecording && (
          <motion.p
            className="text-blue-600 dark:text-blue-400 italic mt-4"
            initial="initial"
            animate="animate"
            variants={ThinkingVariants}
          >
            {t("record.processingAudio")}...
          </motion.p>
        )}
        {!isRecording && !isProcessing && transcript.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 italic">
            {t("record.startRecordingPrompt")}
          </p>
        )}
      </div>
    </div>
  );
}


