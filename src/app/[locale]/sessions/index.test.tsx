import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } => '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionsScreen from './index';
import { useI18n } from '@/i18n';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { RecordingSession } from '@/types';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'sessions.title': 'All Sessions',
        'sessions.fetchError': 'Failed to fetch sessions.',
        'sessions.noSessions': 'No recording sessions found. Start a new one!',
        'session.status.recording': 'Recording',
        'session.status.processing': 'Processing',
        'session.status.completed': 'Completed',
        'session.status.failed': 'Failed',
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

// Mock fetch for API calls
global.fetch = vi.fn();

describe('SessionsScreen', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue({
      push: mockPush,
    });
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]), // Default empty array
    });
  });

  it('renders loading state initially', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'loading' });

    render(<SessionsScreen />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login if unauthenticated', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<SessionsScreen />);

    expect(mockPush).toHaveBeenCalledWith('/en/auth/login');
  });

  it('renders "No sessions found" message if no sessions are available', async () => {
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
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(<SessionsScreen />);

    await waitFor(() => {
      expect(screen.getByText('All Sessions')).toBeInTheDocument();
      expect(screen.getByText('No recording sessions found. Start a new one!')).toBeInTheDocument();
    });
  });

  it('displays error message if fetching sessions fails', async () => {
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
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Network error' }),
    });

    render(<SessionsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch sessions.')).toBeInTheDocument();
    });
  });

  it('renders a list of sessions for an authenticated user', async () => {
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

    const mockSessions: RecordingSession[] = [
      {
        id: 'session-1',
        title: 'Daily Standup',
        status: 'completed',
        duration_seconds: 900,
        language_code: 'en',
        created_at: new Date('2023-01-15T10:00:00Z').toISOString(),
        updated_at: new Date('2023-01-15T10:15:00Z').toISOString(),
        user_id: 'user123',
        audio_file_path: '',
        transcript: '',
        user_notes: '',
        ai_summary: '',
      },
      {
        id: 'session-2',
        title: 'Project Planning',
        status: 'processing',
        duration_seconds: 1800,
        language_code: 'en',
        created_at: new Date('2023-01-14T14:30:00Z').toISOString(),
        updated_at: new Date('2023-01-14T14:45:00Z').toISOString(),
        user_id: 'user123',
        audio_file_path: '',
        transcript: '',
        user_notes: '',
        ai_summary: '',
      },
    ];

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSessions),
    });

    render(<SessionsScreen />);

    await waitFor(() => {
      expect(screen.getByText('All Sessions')).toBeInTheDocument();
      expect(screen.getByText('Daily Standup')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Project Planning')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });
  });

  it('navigates to session detail page when a session is clicked', async () => {
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

    const mockSessions: RecordingSession[] = [
      {
        id: 'session-1',
        title: 'Daily Standup',
        status: 'completed',
        duration_seconds: 900,
        language_code: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user123',
        audio_file_path: '',
        transcript: '',
        user_notes: '',
        ai_summary: '',
      },
    ];

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSessions),
    });

    render(<SessionsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Daily Standup')).toBeInTheDocument();
    });

    const sessionButton = screen.getByRole('button', { name: /Daily Standup/i });
    await userEvent.click(sessionButton);

    expect(mockPush).toHaveBeenCalledWith('/en/sessions/session-1');
  });
});

