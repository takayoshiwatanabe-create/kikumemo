"use client";

import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n";
import { useSessionStore } from "@/stores/session-store";
import AudioVisualizer from "@/components/audio/audio-visualizer";
import RecordingControls from "@/components/audio/recording-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Language } from "@/i18n/translations"; // Import Language type

export default function RecordScreen() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    currentSession,
    isRecording,
    audioData,
    isLoading,
    error,
    createSession,
    startRecording,
    stopRecording,
    // updateUserNotes, // Not used in this component currently
    processSession,
  } = useSessionStore();

  const [sessionTitle, setSessionTitle] = useState("");
  const [userNotes, setUserNotes] = useState(""); // State for user notes, though not used in UI yet
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${lang}/auth/login`);
    }
  }, [status, lang, router]);

  const initAudioProcessing = async (stream: MediaStream) => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    source.connect(analyserRef.current);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualizer = () => {
      if (!analyserRef.current || !isRecording || isPaused) {
        animationFrameIdRef.current = null;
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArray);

      let sumSquares = 0;
      for (const amplitude of dataArray) {
        sumSquares += amplitude * amplitude;
      }
      const rms = Math.sqrt(sumSquares / dataArray.length);
      const normalizedVolume = rms / 128;

      const frequencies = Array.from(dataArray).map(val => val / 255);

      useSessionStore.setState({
        audioData: {
          frequencies: frequencies,
          volume: normalizedVolume,
        },
      });

      animationFrameIdRef.current = requestAnimationFrame(updateVisualizer);
    };

    animationFrameIdRef.current = requestAnimationFrame(updateVisualizer);
  };

  const stopAudioProcessing = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    useSessionStore.setState({ audioData: null });
  };

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
      await createSession(sessionTitle, lang as Language); // Cast lang to Language

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });

      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        stopAudioProcessing();
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

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

          await processSession();
          router.push(`/${lang}/sessions/${currentSession.id}`);
        }
      };

      mediaRecorderRef.current.start();
      startRecording();
      setIsPaused(false);
      initAudioProcessing(stream);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert(t("record.permissionDenied"));
      useSessionStore.setState({ error: "Failed to start recording" });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      stopRecording();
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopAudioProcessing();
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      if (mediaRecorderRef.current.stream) {
        initAudioProcessing(mediaRecorderRef.current.stream);
      }
    }
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

      <AudioVisualizer audioData={audioData} isRecording={isRecording && !isPaused} />

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

