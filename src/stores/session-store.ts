import { create } from "zustand";
import { RecordingSession, AudioVisualizerMessage, AISummaryResponse } from "@/types";
import { Language } from "@/i18n";

interface SessionStore {
  currentSession: RecordingSession | null;
  sessions: RecordingSession[];
  isRecording: boolean;
  audioData: AudioVisualizerMessage | null;
  isLoading: boolean;
  error: string | null;
  
  createSession: (title: string, language: Language) => Promise<void>;
  startRecording: () => void; // Handled by useAudioRecorder hook
  stopRecording: () => void; // Handled by useAudioRecorder hook
  updateUserNotes: (notes: string) => void;
  processSession: (sessionId: string, transcript: string, userNotes: string, language: Language) => Promise<void>;
  setAudioData: (data: AudioVisualizerMessage | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  sessions: [],
  isRecording: false,
  audioData: null,
  isLoading: false,
  error: null,

  createSession: async (title: string, language: Language) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create session");
      }

      const newSession: RecordingSession = await response.json();
      set({ currentSession: newSession, isRecording: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  startRecording: () => {
    set({ isRecording: true, error: null });
  },

  stopRecording: () => {
    set({ isRecording: false, audioData: null });
  },

  updateUserNotes: (notes: string) => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, user_notes: notes }
        : null,
    }));
  },

  processSession: async (sessionId: string, transcript: string, userNotes: string, language: Language) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/sessions/${sessionId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript, userNotes, language }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process session");
      }

      const result = await response.json();
      set((state) => ({
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              transcript: result.transcript,
              ai_summary: result.aiSummary,
              status: "completed",
            }
          : null,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  setAudioData: (data: AudioVisualizerMessage | null) => {
    set({ audioData: data });
  },

  clearError: () => {
    set({ error: null });
  },
}));


