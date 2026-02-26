import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsScreen from './index';
import { useI18n } from '@/i18n';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/user-store';
import { UserPreferences } from '@/types';
import { Session } from 'next-auth';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'settings.title': 'Settings',
        'settings.language': 'Language',
        'settings.timezone': 'Timezone',
        'settings.audioQuality': 'Audio Quality',
        'settings.audioQualityStandard': 'Standard',
        'settings.audioQualityHigh': 'High',
        'settings.autoSave': 'Auto Save',
        'settings.exportFormat': 'Export Format',
        'language.ja': 'Japanese',
        'language.en': 'English',
        'language.zh': 'Chinese',
        'language.ko': 'Korean',
        'language.es': 'Spanish',
        'language.fr': 'French',
        'language.de': 'German',
        'language.pt': 'Portuguese',
        'language.ar': 'Arabic',
        'language.hi': 'Hindi',
      };
      return translations[key] || key;
    },
    lang: 'en',
    setLanguage: vi.fn(),
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

// Mock useUserStore
vi.mock('@/stores/user-store', () => ({
  useUserStore: vi.fn(),
}));

describe('SettingsScreen', () => {
  const mockPush = vi.fn();
  const mockSetLanguage = vi.fn();
  const mockFetchUserPreferences = vi.fn();
  const mockUpdateUserPreferences = vi.fn();

  const defaultUserPreferences: UserPreferences = {
    language: 'en',
    timezone: 'Asia/Tokyo',
    audioQuality: 'standard',
    autoSave: true,
    exportFormat: 'markdown',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as vi.Mock).mockReturnValue({
      push: mockPush,
    });
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'common.loading': 'Loading...',
          'common.error': 'Error',
          'settings.title': 'Settings',
          'settings.language': 'Language',
          'settings.timezone': 'Timezone',
          'settings.audioQuality': 'Audio Quality',
          'settings.audioQualityStandard': 'Standard',
          'settings.audioQualityHigh': 'High',
          'settings.autoSave': 'Auto Save',
          'settings.exportFormat': 'Export Format',
          'language.ja': 'Japanese',
          'language.en': 'English',
          'language.zh': 'Chinese',
          'language.ko': 'Korean',
          'language.es': 'Spanish',
          'language.fr': 'French',
          'language.de': 'German',
          'language.pt': 'Portuguese',
          'language.ar': 'Arabic',
          'language.hi': 'Hindi',
        };
        return translations[key] || key;
      },
      lang: 'en',
      setLanguage: mockSetLanguage,
      isRTL: false,
    });
    (useUserStore as vi.Mock).mockReturnValue({
      userPreferences: defaultUserPreferences,
      fetchUserPreferences: mockFetchUserPreferences,
      updateUserPreferences: mockUpdateUserPreferences,
      isLoading: false,
      error: null,
    });
  });

  it('renders loading state initially', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'loading' });

    render(<SettingsScreen />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to login if unauthenticated', () => {
    (useSession as vi.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<SettingsScreen />);

    expect(mockPush).toHaveBeenCalledWith('/en/auth/login');
  });

  it('fetches user preferences on authenticated mount if not already loaded', async () => {
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
    (useUserStore as vi.Mock).mockReturnValue({
      userPreferences: null, // Simulate not loaded yet
      fetchUserPreferences: mockFetchUserPreferences,
      updateUserPreferences: mockUpdateUserPreferences,
      isLoading: false,
      error: null,
    });

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(mockFetchUserPreferences).toHaveBeenCalledTimes(1);
    });
  });

  it('renders settings content for authenticated user with loaded preferences', async () => {
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

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Language')).toBeInTheDocument();
      expect(screen.getByLabelText('Timezone')).toBeInTheDocument();
      expect(screen.getByLabelText('Audio Quality')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto Save')).toBeInTheDocument();
      expect(screen.getByLabelText('Export Format')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Auto Save' })).toBeChecked();
    });
  });

  it('updates language preference and calls setLanguage', async () => {
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

    render(<SettingsScreen />);

    const languageSelect = screen.getByLabelText('Language');
    await userEvent.selectOptions(languageSelect, 'ja');

    await waitFor(() => {
      expect(languageSelect).toHaveValue('ja');
      expect(mockSetLanguage).toHaveBeenCalledWith('ja');
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ language: 'ja' });
    });
  });

  it('updates timezone preference', async () => {
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

    render(<SettingsScreen />);

    const timezoneSelect = screen.getByLabelText('Timezone');
    await userEvent.selectOptions(timezoneSelect, 'America/New_York');

    await waitFor(() => {
      expect(timezoneSelect).toHaveValue('America/New_York');
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ timezone: 'America/New_York' });
    });
  });

  it('updates audio quality preference', async () => {
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

    render(<SettingsScreen />);

    const audioQualitySelect = screen.getByLabelText('Audio Quality');
    await userEvent.selectOptions(audioQualitySelect, 'high');

    await waitFor(() => {
      expect(audioQualitySelect).toHaveValue('high');
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ audio_quality: 'high' });
    });
  });

  it('toggles auto save preference', async () => {
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

    render(<SettingsScreen />);

    const autoSaveSwitch = screen.getByRole('checkbox', { name: 'Auto Save' });
    expect(autoSaveSwitch).toBeChecked();

    await userEvent.click(autoSaveSwitch);

    await waitFor(() => {
      expect(autoSaveSwitch).not.toBeChecked();
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ auto_save: false });
    });

    await userEvent.click(autoSaveSwitch);

    await waitFor(() => {
      expect(autoSaveSwitch).toBeChecked();
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ auto_save: true });
    });
  });

  it('updates export format preference', async () => {
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

    render(<SettingsScreen />);

    const exportFormatSelect = screen.getByLabelText('Export Format');
    await userEvent.selectOptions(exportFormatSelect, 'pdf');

    await waitFor(() => {
      expect(exportFormatSelect).toHaveValue('pdf');
      expect(mockUpdateUserPreferences).toHaveBeenCalledWith({ export_format: 'pdf' });
    });
  });

  it('displays error message if fetching preferences fails', async () => {
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
    (useUserStore as vi.Mock).mockReturnValue({
      userPreferences: null,
      fetchUserPreferences: mockFetchUserPreferences,
      updateUserPreferences: mockUpdateUserPreferences,
      isLoading: false,
      error: 'Failed to load preferences',
    });

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load preferences')).toBeInTheDocument();
    });
  });
});

