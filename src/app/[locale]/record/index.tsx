"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { useSessionStore } from "@/stores/session-store";
import AudioVisualizer from "@/components/audio/audio-visualizer";
import RecordingControls from "@/components/audio/recording-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Language } from "@/i18n";
import RealtimeTranscript from "@/components/ai/realtime-transcript";
import { AudioVisualizerMessage } from "@/types";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { motion } from "framer-motion";

export default function RecordScreen() {
  const { t, lang, isRTL } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    currentSession,
    isLoading,
    error,
    createSession,
    processSession,
  } = useSessionStore();

  const [sessionTitle, setSessionTitle] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [transcript, setTranscript] = useState<string>("");
  const [audioVisualizerData, setAudioVisualizerData] = useState<AudioVisualizerMessage | null>(null);

  const {
    isRecording,
    isPaused,
    start: startRecordingHook,
    stop: stopRecordingHook,
    pause: pauseRecordingHook,
    resume: resumeRecordingHook,
  } = useAudioRecorder({
    onDataAvailable: (data) => {
      if (data.size > 0) {
        // This is a placeholder for actual real-time transcription.
        // In a real scenario, `data` would be sent to a WebSocket for transcription.
        // For now, we simulate some activity and update visualizer.
        // setTranscript(prev => prev + " " + t("record.listeningChunk")); // Removed for cleaner simulation

        const volume = Math.random(); // Simulate volume
        const frequencies = Array.from({ length: 50 }, () => Math.random()); // Simulate frequencies
        setAudioVisualizerData({
          type: 'audio_data',
          sessionId: currentSession?.id || 'mock-session-id', // Use mock if session not created yet
          frequencies: frequencies,
          volume: volume,
        });
      }
    },
    onStop: async (audioBlob) => {
      if (currentSession) {
        const formData = new FormData();
        formData.append("audioBlob", audioBlob);
        formData.append("userNotes", userNotes);

        const uploadResponse = await fetch(`/api/sessions/${currentSession.id}/upload-audio`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload audio");
        }

        // The `processSession` in the store should handle the API call to `/api/sessions/:id/process`
        // It needs the current transcript (even if empty for now), user notes, and language.
        await processSession(currentSession.id, transcript, userNotes, lang as Language);
        router.push(`/${lang}/sessions/${currentSession.id}`);
      }
    },
    onError: (err) => {
      console.error("Recording error:", err);
      useSessionStore.setState({ error: err.message });
    }
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${lang}/auth/login`);
    }
  }, [status, lang, router]);

  const handleStartRecording = async () => {
    if (!sessionTitle.trim()) {
      alert(t("record.titleRequired"));
      return;
    }

    if (status === "loading" || status === "unauthenticated") {
      alert(t("common.authRequired"));
      return;
    }

    try {
      await createSession(sessionTitle, lang as Language);
      setTranscript("");
      setAudioVisualizerData(null);
      startRecordingHook();
    } catch (err: any) {
      console.error("Error starting recording:", err);
      alert(t("record.permissionDenied"));
      useSessionStore.setState({ error: err.message || "Failed to start recording" });
    }
  };

  const handleStopRecording = () => {
    stopRecordingHook();
    setAudioVisualizerData(null);
  };

  const handlePauseRecording = () => {
    pauseRecordingHook();
    setAudioVisualizerData(null);
  };

  const handleResumeRecording = () => {
    resumeRecordingHook();
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
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
      className={`flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 dark:bg-gray-900 ${isRTL ? "rtl" : "ltr"}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
        variants={itemVariants}
      >
        {t("record.title")}
      </motion.h1>
      <motion.p
        className="mb-8 text-center text-lg text-gray-700 dark:text-gray-300"
        variants={itemVariants}
      >
        {t("record.instructions")}
      </motion.p>

      <motion.div className="mb-8 w-full max-w-md" variants={itemVariants}>
        <Label htmlFor="session-title" className="mb-2 block text-lg font-medium text-gray-800 dark:text-gray-200">
          {t("record.sessionTitle")}
        </Label>
        <Input
          id="session-title"
          type="text"
          placeholder={t("record.sessionTitlePlaceholder")}
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          disabled={isRecording || isLoading}
          className={`w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 ${isRTL ? "text-right" : "text-left"}`}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <AudioVisualizer audioData={audioVisualizerData} isRecording={isRecording && !isPaused} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <RealtimeTranscript
          transcript={transcript}
          isRecording={isRecording && !isPaused}
          isProcessing={isLoading && !isRecording}
        />
      </motion.div>

      <motion.div className="mt-8" variants={itemVariants}>
        <RecordingControls
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPauseRecording={handlePauseRecording}
          onResumeRecording={handleResumeRecording}
          isPaused={isPaused}
          disabled={isLoading || !sessionTitle.trim()}
        />
      </motion.div>

      {isLoading && (
        <motion.p
          className="mt-4 text-lg text-blue-600 dark:text-blue-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t("common.loading")}...
        </motion.p>
      )}
      {error && (
        <motion.p
          className="mt-4 text-lg text-red-600 dark:text-red-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t("common.error")}: {error}
        </motion.p>
      )}
    </motion.div>
  );
}


