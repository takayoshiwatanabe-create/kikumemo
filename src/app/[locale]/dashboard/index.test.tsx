import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardScreen from './index';
import { useI18n } from '@/i18n';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string, options?: { name?: string }) => {
      if (key === 'dashboard.title') return 'Dashboard';
      if (key === 'dashboard.welcomeMessage') return `Welcome, ${options?.name || 'User'}!`;
      if (key === 'dashboard.startNewRecording') return 'Start New Recording';
      if (key === 'dashboard.viewAllSessions') return 'View All Sessions';
      if (key === 'common.loading') return 'Loading...';
      return key;
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

describe('DashboardScreen', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders loading state initially', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'loading' });

    render(<DashboardScreen />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login if unauthenticated', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<DashboardScreen />);

    expect(mockPush).toHaveBeenCalledWith('/en/auth/login');
  });

  it('renders dashboard content for authenticated user', async () => {
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

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Start New Recording' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View All Sessions' })).toBeInTheDocument();
    });
  });

  it('navigates to record page when "Start New Recording" is clicked', async () => {
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

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const startRecordingButton = screen.getByRole('button', { name: 'Start New Recording' });
    await userEvent.click(startRecordingButton);

    expect(mockPush).toHaveBeenCalledWith('/en/record');
  });

  it('navigates to sessions page when "View All Sessions" is clicked', async () => {
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

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    const viewSessionsButton = screen.getByRole('button', { name: 'View All Sessions' });
    await userEvent.click(viewSessionsButton);

    expect(mockPush).toHaveBeenCalledWith('/en/sessions');
  });
});
