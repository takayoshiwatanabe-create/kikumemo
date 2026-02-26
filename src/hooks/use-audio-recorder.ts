import { useState, useRef, useEffect, useCallback } from "react";
import { useSessionStore } from "@/stores/session-store";
import { AudioVisualizerMessage } from "@/types";

interface UseAudioRecorderOptions {
  onDataAvailable?: (data: Blob) => void;
  onStop?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
}

export function useAudioRecorder(options?: UseAudioRecorderOptions) {
  const { onDataAvailable, onStop, onError } = options || {};
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const setAudioData = useSessionStore((state) => state.setAudioData);

  const initAudioProcessing = useCallback((stream: MediaStream) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256; // Smaller FFT size for faster visualization
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
      const normalizedVolume = rms / 128; // Max amplitude is 255, so rms max is ~180. 128 is a good heuristic for normalization.

      const frequencies = Array.from(dataArray).map(val => val / 255); // Normalize to 0-1

      setAudioData({
        type: 'audio_data',
        sessionId: '', // Session ID will be set by the component using this hook
        frequencies: frequencies,
        volume: normalizedVolume,
      });

      animationFrameIdRef.current = requestAnimationFrame(updateVisualizer);
    };

    animationFrameIdRef.current = requestAnimationFrame(updateVisualizer);
  }, [isRecording, isPaused, setAudioData]);

  const stopAudioProcessing = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioData(null);
  }, [setAudioData]);

  const start = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          onDataAvailable?.(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        stopAudioProcessing();
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        onStop?.(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
        setIsRecording(false);
        setIsPaused(false);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        onError?.("Recording error occurred.");
        stop(); // Attempt to stop gracefully
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      initAudioProcessing(stream);
    } catch (err: any) {
      console.error("Error starting recording:", err);
      onError?.(err.message || "Failed to get audio stream. Please check microphone permissions.");
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording, onDataAvailable, onStop, onError, initAudioProcessing, stopAudioProcessing]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pause = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopAudioProcessing();
    }
  }, [stopAudioProcessing]);

  const resume = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      if (mediaStream) {
        initAudioProcessing(mediaStream);
      }
    }
  }, [mediaStream, initAudioProcessing]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopAudioProcessing();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream, stopAudioProcessing]);

  return {
    isRecording,
    isPaused,
    start,
    stop,
    pause,
    resume,
    audioChunks: audioChunksRef.current,
  };
}


