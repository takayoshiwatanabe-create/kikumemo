import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecordScreen from './index';
import { useI18n } from '@/i18n';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/session-store';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { Session } from 'next-auth';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string, options?: { name?: string }) => {
      const translations: Record<string, string> = {
        'record.title': 'New Recording',
        'record.instructions': 'Start recording your meeting.',
        'record.sessionTitle': 'Session Title',
        'record.sessionTitlePlaceholder': 'e.g., Team Standup',
        'record.startButton': 'Start Recording',
        'record.stopButton': 'Stop Recording',
        'record.pauseButton': 'Pause Recording',
        'record.resumeButton': 'Resume Recording',
        'record.titleRequired': 'Session title is required.',
        'common.authRequired': 'Authentication required.',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'record.listening': 'Listening',
        'record.processingAudio': 'Processing Audio',
        'record.startRecordingPrompt': 'Click start to begin recording.',
        'record.realtimeTranscript': 'Real-time Transcript',
        'record.permissionDenied': 'Permission denied to access microphone.',
      };
      return translations[key] || key;
    },
    lang: 'en',
    isRTL: false,
  }),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock useSessionStore
vi.mock('@/stores/session-store', () => ({
  useSessionStore: vi.fn(),
}));

// Mock useAudioRecorder
vi.mock('@/hooks/use-audio-recorder', () => ({
  useAudioRecorder: vi.fn(),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('RecordScreen', () => {
  const mockPush = vi.fn();
  const mockCreateSession = vi.fn();
  const mockProcessSession = vi.fn();
  const mockStartRecordingHook = vi.fn();
  const mockStopRecordingHook = vi.fn();
  const mockPauseRecordingHook = vi.fn();
  const mockResumeRecordingHook = vi.fn();
  const mockSetState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSessionStore as vi.Mock).mockReturnValue({
      currentSession: null,
      isLoading: false,
      error: null,
      createSession: mockCreateSession,
      processSession: mockProcessSession,
      setState: mockSetState,
    });
    (useAudioRecorder as vi.Mock).mockReturnValue({
      isRecording: false,
      isPaused: false,
      start: mockStartRecordingHook,
      stop: mockStopRecordingHook,
      pause: mockPauseRecordingHook,
      resume: mockResumeRecordingHook,
      onDataAvailable: vi.fn(),
      onStop: vi.fn(),
      onError: vi.fn(),
    });
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });
  });

  it('renders loading state initially', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'loading' });

    render(<RecordScreen />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login if unauthenticated', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<RecordScreen />);

    expect(mockPush).toHaveBeenCalledWith('/en/auth/login');
  });

  it('renders record screen content for authenticated user', async () => {
    const mockSession: Session = {
      expires: '1',
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'free',
      },
    };
    (useSession as vi.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });

    render(<RecordScreen />);

    await waitFor(() => {
      expect(screen.getByText('New Recording')).toBeInTheDocument();
      expect(screen.getByLabelText('Session Title')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Team Standup')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start Recording' })).toBeInTheDocument();
      expect(screen.getByText('Click start to begin recording.')).toBeInTheDocument();
    });
  });

  it('shows alert if session title is empty when starting recording', async () => {
    const mockSession: Session = {
      expires: '1',
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'free',
      },
    };
    (useSession as vi.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<RecordScreen />);

    const startButton = screen.getByRole('button', { name: 'Start Recording' });
    await userEvent.click(startButton);

    expect(alertSpy).toHaveBeenCalledWith('Session title is required.');
    expect(mockCreateSession).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('starts recording and creates a session', async () => {
    const mockSession: Session = {
      expires: '1',
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'free',
      },
    };
    (useSession as vi.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });
    mockCreateSession.mockResolvedValueOnce({ id: 'session123' });
    (useSessionStore as vi.Mock).mockReturnValue({
      currentSession: { id: 'session123' },
      isLoading: false,
      error: null,
      createSession: mockCreateSession,
      processSession: mockProcessSession,
      setState: mockSetState,
    });
    (useAudioRecorder as vi.Mock).mockReturnValue({
      isRecording: false,
      isPaused: false,
      start: mockStartRecordingHook,
      stop: mockStopRecordingHook,
      pause: mockPauseRecordingHook,
      resume: mockResumeRecordingHook,
      onDataAvailable: vi.fn(),
      onStop: vi.fn(),
      onError: vi.fn(),
    });

    render(<RecordScreen />);

    const titleInput = screen.getByLabelText('Session Title');
    await userEvent.type(titleInput, 'My Test Meeting');

    const startButton = screen.getByRole('button', { name: 'Start Recording' });
    await userEvent.click(startButton);

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledWith('My Test Meeting', 'en');
      expect(mockStartRecordingHook).toHaveBeenCalled();
    });
  });

  it('stops recording and processes the session', async () => {
    const mockSession: Session = {
      expires: '1',
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'free',
      },
    };
    (useSession as vi.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });
    (useSessionStore as vi.Mock).mockReturnValue({
      currentSession: { id: 'session123' },
      isLoading: false,
      error: null,
      createSession: mockCreateSession,
      processSession: mockProcessSession,
      setState: mockSetState,
    });

    const mockAudioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    let onStopCallback: ((blob: Blob) => Promise<void>) | undefined;

    (useAudioRecorder as vi.Mock).mockImplementation(({ onStop }) => {
      onStopCallback = onStop;
      return {
        isRecording: true,
        isPaused: false,
        start: mockStartRecordingHook,
        stop: mockStopRecordingHook,
        pause: mockPauseRecordingHook,
        resume: mockResumeRecordingHook,
        onDataAvailable: vi.fn(),
        onStop: onStop,
        onError: vi.fn(),
      };
    });

    render(<RecordScreen />);

    // Simulate recording started
    (useAudioRecorder as vi.Mock).mockReturnValue({
      isRecording: true,
      isPaused: false,
      start: mockStartRecordingHook,
      stop: mockStopRecordingHook,
      pause: mockPauseRecordingHook,
      resume: mockResumeRecordingHook,
      onDataAvailable: vi.fn(),
      onStop: onStopCallback,
      onError: vi.fn(),
    });
    // Re-render to update controls
    render(<RecordScreen />);

    const stopButton = screen.getByRole('button', { name: 'Stop Recording' });
    await userEvent.click(stopButton);

    expect(mockStopRecordingHook).toHaveBeenCalled();

    // Manually trigger the onStop callback from useAudioRecorder mock
    if (onStopCallback) {
      await onStopCallback(mockAudioBlob);
    }

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/sessions/session123/upload-audio',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(mockProcessSession).toHaveBeenCalledWith('session123', '', '', 'en');
      expect(mockPush).toHaveBeenCalledWith('/en/sessions/session123');
    });
  });

  it('pauses and resumes recording', async () => {
    const mockSession: Session = {
      expires: '1',
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'free',
      },
    };
    (useSession as vi.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });
    (useSessionStore as vi.Mock).mockReturnValue({
      currentSession: { id: 'session123' },
      isLoading: false,
      error: null,
      createSession: mockCreateSession,
      processSession: mockProcessSession,
      setState: mockSetState,
    });

    // Simulate recording started
    (useAudioRecorder as vi.Mock).mockReturnValue({
      isRecording: true,
      isPaused: false,
      start: mockStartRecordingHook,
      stop: mockStopRecordingHook,
      pause: mockPauseRecordingHook,
      resume: mockResumeRecordingHook,
      onDataAvailable: vi.fn(),
      onStop: vi.fn(),
      onError: vi.fn(),
    });
    render(<RecordScreen />);

    const pauseButton = screen.getByRole('button', { name: 'Pause Recording' });
    await userEvent.click(pauseButton);
    expect(mockPauseRecordingHook).toHaveBeenCalled();

    // Simulate recording paused
    (useAudioRecorder as vi.Mock).mockReturnValue({
      isRecording: true,
      isPaused: true,
      start: mockStartRecordingHook,
      stop: mockStopRecordingHook,
      pause: mockPauseRecordingHook,
      resume: mockResumeRecordingHook,
      onDataAvailable: vi.fn(),
      onStop: vi.fn(),
      onError: vi.fn(),
    });
    // Re-render to update controls
    render(<RecordScreen />);

    const resumeButton = screen.getByRole('button', { name: 'Resume Recording' });
    await userEvent.click(resumeButton);
    expect(mockResumeRecordingHook).toHaveBeenCalled();
  });

  it('displays error message if recording fails to start', async () => {
    const mockSession: Session = {
      expires: '1',
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        subscription_plan: 'free',
      },
    };
    (useSession as vi.Mock).mockReturnValue({ data: mockSession, status: 'authenticated' });
    mockCreateSession.mockRejectedValueOnce(new Error('Microphone access denied'));
    (useSessionStore as vi.Mock).mockReturnValue({
      currentSession: null,
      isLoading: false,
      error: null,
      createSession: mockCreateSession,
      processSession: mockProcessSession,
      setState: mockSetState,
    });
    (useAudioRecorder as vi.Mock).mockReturnValue({
      isRecording: false,
      isPaused: false,
      start: mockStartRecordingHook,
      stop: mockStopRecordingHook,
      pause: mockPauseRecordingHook,
      resume: mockResumeRecordingHook,
      onDataAvailable: vi.fn(),
      onStop: vi.fn(),
      onError: vi.fn(),
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<RecordScreen />);

    const titleInput = screen.getByLabelText('Session Title');
    await userEvent.type(titleInput, 'My Test Meeting');

    const startButton = screen.getByRole('button', { name: 'Start Recording' });
    await userEvent.click(startButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Permission denied to access microphone.');
      expect(mockSetState).toHaveBeenCalledWith({ error: 'Microphone access denied' });
    });
    alertSpy.mockRestore();
  });
});
