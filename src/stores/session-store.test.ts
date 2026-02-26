import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSessionStore } from './session-store';
import { RecordingSession } from '@/types';
import { Language } from '@/i18n';

// Mock global fetch
global.fetch = vi.fn();

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: vi.fn(() => 'mock-uuid'),
} as any;

describe('useSessionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state before each test
    act(() => {
      useSessionStore.setState({
        currentSession: null,
        sessions: [],
        isRecording: false,
        audioData: null,
        isLoading: false,
        error: null,
      });
    });
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useSessionStore());
    expect(result.current.currentSession).toBe(null);
    expect(result.current.sessions).toEqual([]);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.audioData).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  describe('createSession', () => {
    it('creates a new session successfully', async () => {
      const mockNewSession: RecordingSession = {
        id: 'mock-session-id',
        user_id: 'mock-user-id',
        title: 'Test Meeting',
        status: 'recording',
        audio_file_path: null,
        transcript: null,
        user_notes: null,
        ai_summary: null,
        duration_seconds: 0,
        language_code: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNewSession),
      });

      const { result } = renderHook(() => useSessionStore());

      await act(async () => {
        await result.current.createSession('Test Meeting', 'en' as Language);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Test Meeting', language: 'en' }),
      });
      expect(result.current.currentSession).toEqual(mockNewSession);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error state if session creation fails', async () => {
      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to create session' }),
      });

      const { result } = renderHook(() => useSessionStore());

      await act(async () => {
        await result.current.createSession('Failed Meeting', 'en' as Language);
      });

      expect(result.current.currentSession).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to create session');
    });
  });

  describe('processSession', () => {
    it('processes a session successfully', async () => {
      const sessionId = 'mock-session-id';
      const transcript = 'This is a test transcript.';
      const userNotes = 'Some user notes.';
      const language = 'en' as Language;

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Session processed successfully' }),
      });

      const { result } = renderHook(() => useSessionStore());

      await act(async () => {
        await result.current.processSession(sessionId, transcript, userNotes, language);
      });

      expect(global.fetch).toHaveBeenCalledWith(`/api/sessions/${sessionId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript, userNotes, language }),
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('sets error state if session processing fails', async () => {
      const sessionId = 'mock-session-id';
      const transcript = 'This is a test transcript.';
      const userNotes = 'Some user notes.';
      const language = 'en' as Language;

      (global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to process session' }),
      });

      const { result } = renderHook(() => useSessionStore());

      await act(async () => {
        await result.current.processSession(sessionId, transcript, userNotes, language);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to process session');
    });
  });

  describe('startRecording', () => {
    it('sets isRecording to true', () => {
      const { result } = renderHook(() => useSessionStore());
      act(() => {
        result.current.startRecording();
      });
      expect(result.current.isRecording).toBe(true);
    });
  });

  describe('stopRecording', () => {
    it('sets isRecording to false', () => {
      const { result } = renderHook(() => useSessionStore());
      act(() => {
        result.current.startRecording(); // First start
        result.current.stopRecording();
      });
      expect(result.current.isRecording).toBe(false);
    });
  });

  describe('updateUserNotes', () => {
    it('updates user notes for the current session', () => {
      const mockSession: RecordingSession = {
        id: 'mock-session-id',
        user_id: 'mock-user-id',
        title: 'Test Meeting',
        status: 'recording',
        audio_file_path: null,
        transcript: null,
        user_notes: null,
        ai_summary: null,
        duration_seconds: 0,
        language_code: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      act(() => {
        useSessionStore.setState({ currentSession: mockSession });
      });

      const { result } = renderHook(() => useSessionStore());
      act(() => {
        result.current.updateUserNotes('New notes here.');
      });

      expect(result.current.currentSession?.user_notes).toBe('New notes here.');
    });

    it('does nothing if no current session', () => {
      const { result } = renderHook(() => useSessionStore());
      act(() => {
        result.current.updateUserNotes('New notes here.');
      });
      expect(result.current.currentSession).toBe(null);
    });
  });

  describe('setAudioData', () => {
    it('updates audioData state', () => {
      const mockAudioData = {
        type: 'audio_data',
        sessionId: '123',
        frequencies: [0.1, 0.2],
        volume: 0.5,
      };
      const { result } = renderHook(() => useSessionStore());
      act(() => {
        result.current.setAudioData(mockAudioData);
      });
      expect(result.current.audioData).toEqual(mockAudioData);
    });
  });

  describe('clearError', () => {
    it('clears the error state', () => {
      act(() => {
        useSessionStore.setState({ error: 'Some error' });
      });
      const { result } = renderHook(() => useSessionStore());
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBe(null);
    });
  });
});
