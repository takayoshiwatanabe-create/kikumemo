import { create } from "zustand";
import { RecordingSession, AudioData } from "@/types";
import { Language } from "@/i18n/translations"; // Import Language type

interface SessionStore {
  currentSession: RecordingSession | null;
  sessions: RecordingSession[];
  isRecording: boolean;
  audioData: AudioData | null;
  isLoading: boolean; // Added isLoading as per design
  error: string | null;

  // Actions
  createSession: (title: string, language?: Language) => Promise<void>; // Added language parameter
  startRecording: () => void;
  stopRecording: () => void;
  updateUserNotes: (notes: string) => void;
  processSession: () => Promise<void>;
  // Add more actions as needed, e.g., setAudioData, setError, etc.
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentSession: null,
  sessions: [],
  isRecording: false,
  audioData: null,
  isLoading: false,
  error: null,

  createSession: async (title: string, language: Language = "en") => { // Default language to 'en'
    set({ isLoading: true, error: null });
    try {
      // Call API to create session
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

      set((state) => ({
        currentSession: newSession,
        sessions: [newSession, ...state.sessions],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to create session", isLoading: false });
      throw err; // Re-throw to allow component to catch
    }
  },

  startRecording: () => {
    set({ isRecording: true });
    // Logic to start audio recording
  },

  stopRecording: () => {
    set({ isRecording: false });
    // Logic to stop audio recording and potentially upload
  },

  updateUserNotes: (notes: string) => {
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, user_notes: notes }
        : null,
    }));
  },

  processSession: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!useSessionStore.getState().currentSession?.id) {
        throw new Error("No current session to process.");
      }
      const sessionId = useSessionStore.getState().currentSession!.id;
      // The transcript, userNotes, and language should ideally be fetched from the session
      // or passed as parameters if they are mutable after recording.
      // For now, using the currentSession state, which might be stale if not updated.
      // const transcript = useSessionStore.getState().currentSession!.transcript || ""; // Not used directly in API call
      // const userNotes = useSessionStore.getState().currentSession!.user_notes || ""; // Not used directly in API call
      // const language = useSessionStore.getState().currentSession!.language_code || "en"; // Not used directly in API call

      // Simulate API call for processing (e.g., AI summarization)
      // This would typically be a separate API call, or triggered by the upload-audio endpoint.
      // For now, we'll simulate the status update.
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Example of a real API call for processing:
      // const response = await fetch(`/api/sessions/${sessionId}/process`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ transcript, userNotes, language }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Failed to process session");
      // }

      set((state) => ({
        currentSession: state.currentSession
          ? { ...state.currentSession, status: "completed" }
          : null,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to process session", isLoading: false });
      throw err; // Re-throw to allow component to catch
    }
  },
}));

