import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SessionDetailScreen from './[id]';
import { useI18n } from '@/i18n';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Session } from 'next-auth';
import { RecordingSession, AISummaryResponse } from '@/types';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string, options?: { name?: string }) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'session.fetchError': 'Failed to fetch session data.',
        'session.notFound': 'Session not found.',
        'session.status.recording': 'Recording',
        'session.status.processing': 'Processing',
        'session.status.completed': 'Completed',
        'session.status.failed': 'Failed',
        'session.transcript': 'Transcript',
        'session.userNotes': 'User Notes',
        'session.aiSummary': 'AI Summary',
        'session.keyPoints': 'Key Points',
        'session.todos': 'To-Dos',
        'session.decisions': 'Decisions',
        'session.openIssues': 'Open Issues',
        'session.noSummaryAvailable': 'No AI summary available yet.',
        'session.assignee': 'Assignee',
        'session.deadline': 'Deadline',
        'session.priority.high': 'High',
        'session.priority.medium': 'Medium',
        'session.priority.low': 'Low',
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
  useParams: vi.fn(),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('SessionDetailScreen', () => {
  const mockPush = vi.fn();
  const mockSessionId = 'test-session-id-123';

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue({
      push: mockPush,
    });
    (useParams as vi.Mock).mockReturnValue({
      id: mockSessionId,
    });
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}), // Default empty response
    });
  });

  it('renders loading state initially', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'loading' });

    render(<SessionDetailScreen />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login if unauthenticated', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<SessionDetailScreen />);

    expect(mockPush).toHaveBeenCalledWith('/en/auth/login');
  });

  it('displays session not found if API returns 404', async () => {
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
      status: 404,
      json: () => Promise.resolve({ message: 'Session not found' }),
    });

    render(<SessionDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Session not found.')).toBeInTheDocument();
    });
  });

  it('displays error message if API call fails', async () => {
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
      json: () => Promise.resolve({ message: 'Internal server error' }),
    });

    render(<SessionDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch session data.')).toBeInTheDocument();
    });
  });

  it('renders session details and summary for a completed session', async () => {
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

    const mockRecordingSession: RecordingSession = {
      id: mockSessionId,
      user_id: 'user123',
      title: 'My Test Meeting',
      status: 'completed',
      audio_file_path: 'path/to/audio.webm',
      transcript: 'This is the full transcript of the meeting.',
      user_notes: 'Important points noted during the meeting.',
      ai_summary: 'A concise summary generated by AI.',
      duration_seconds: 3600,
      language_code: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockAiOutputs: Array<{ type: string; content: string }> = [
      { type: 'key_points', content: JSON.stringify(['Point 1', 'Point 2']) },
      { type: 'todos', content: JSON.stringify([{ assignee: 'John', task: 'Follow up', priority: 'high' }]) },
      { type: 'decisions', content: JSON.stringify(['Decision A', 'Decision B']) },
      { type: 'open_issues', content: JSON.stringify(['Issue X', 'Issue Y']) },
    ];

    (global.fetch as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecordingSession),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAiOutputs),
      });

    render(<SessionDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('My Test Meeting')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Transcript')).toBeInTheDocument();
      expect(screen.getByText('This is the full transcript of the meeting.')).toBeInTheDocument();
      expect(screen.getByText('User Notes')).toBeInTheDocument();
      expect(screen.getByText('Important points noted during the meeting.')).toBeInTheDocument();
      expect(screen.getByText('AI Summary')).toBeInTheDocument();
      expect(screen.getByText('A concise summary generated by AI.')).toBeInTheDocument();
      expect(screen.getByText('Key Points')).toBeInTheDocument();
      expect(screen.getByText('Point 1')).toBeInTheDocument();
      expect(screen.getByText('To-Dos')).toBeInTheDocument();
      expect(screen.getByText('Follow up')).toBeInTheDocument();
      expect(screen.getByText('Decisions')).toBeInTheDocument();
      expect(screen.getByText('Decision A')).toBeInTheDocument();
      expect(screen.getByText('Open Issues')).toBeInTheDocument();
      expect(screen.getByText('Issue X')).toBeInTheDocument();
    });
  });

  it('renders "No AI summary available yet" for a processing session', async () => {
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

    const mockRecordingSession: RecordingSession = {
      id: mockSessionId,
      user_id: 'user123',
      title: 'Meeting in Progress',
      status: 'processing',
      audio_file_path: 'path/to/audio.webm',
      transcript: 'Partial transcript...',
      user_notes: null,
      ai_summary: null,
      duration_seconds: 120,
      language_code: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecordingSession),
    });

    render(<SessionDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Meeting in Progress')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Transcript')).toBeInTheDocument();
      expect(screen.getByText('Partial transcript...')).toBeInTheDocument();
      expect(screen.getByText('No AI summary available yet.')).toBeInTheDocument();
      expect(screen.getByText('Processing Audio...')).toBeInTheDocument(); // From SummaryDisplay
    });
  });

  it('does not render user notes section if user_notes is null', async () => {
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

    const mockRecordingSession: RecordingSession = {
      id: mockSessionId,
      user_id: 'user123',
      title: 'Meeting without notes',
      status: 'completed',
      audio_file_path: 'path/to/audio.webm',
      transcript: 'Transcript content.',
      user_notes: null,
      ai_summary: 'Summary content.',
      duration_seconds: 600,
      language_code: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (global.fetch as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecordingSession),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]), // No AI outputs
      });

    render(<SessionDetailScreen />);

    await waitFor(() => {
      expect(screen.getByText('Meeting without notes')).toBeInTheDocument();
      expect(screen.queryByText('User Notes')).not.toBeInTheDocument();
      expect(screen.getByText('AI Summary')).toBeInTheDocument();
    });
  });
});

