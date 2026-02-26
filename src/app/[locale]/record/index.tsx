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

export default function RecordScreen() {
  const { t, lang } = useI18n();
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
        setTranscript(prev => prev + " " + t("record.listeningChunk"));

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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t("record.title")}
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-8">
        {t("record.instructions")}
      </p>

      <div className="w-full max-w-md mb-8">
        <Label htmlFor="session-title" className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2 block">
          {t("record.sessionTitle")}
        </Label>
        <Input
          id="session-title"
          type="text"
          placeholder={t("record.sessionTitlePlaceholder")}
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          disabled={isRecording || isLoading}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <AudioVisualizer audioData={audioVisualizerData} isRecording={isRecording && !isPaused} />

      <RealtimeTranscript
        transcript={transcript}
        isRecording={isRecording && !isPaused}
        isProcessing={isLoading && !isRecording}
      />

      <div className="mt-8">
        <RecordingControls
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPauseRecording={handlePauseRecording}
          onResumeRecording={handleResumeRecording}
          isPaused={isPaused}
          disabled={isLoading || !sessionTitle.trim()}
        />
      </div>

      {isLoading && (
        <p className="mt-4 text-lg text-blue-600 dark:text-blue-400">
          {t("common.loading")}...
        </p>
      )}
      {error && (
        <p className="mt-4 text-lg text-red-600 dark:text-red-400">
          {t("common.error")}: {error}
        </p>
      )}
    </div>
  );
}

