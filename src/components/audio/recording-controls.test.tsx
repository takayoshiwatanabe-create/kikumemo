import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecordingControls from './recording-controls';
import { useI18n } from '@/i18n';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

describe('RecordingControls', () => {
  const mockOnStartRecording = vi.fn();
  const mockOnStopRecording = vi.fn();
  const mockOnPauseRecording = vi.fn();
  const mockOnResumeRecording = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'record.startButton': 'Start Recording',
          'record.stopButton': 'Stop Recording',
          'record.pauseButton': 'Pause Recording',
          'record.resumeButton': 'Resume Recording',
        };
        return translations[key] || key;
      },
      lang: 'en',
      isRTL: false,
    });
  });

  it('renders "Start Recording" button when not recording', () => {
    render(
      <RecordingControls
        isRecording={false}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={false}
        disabled={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Start Recording' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Stop Recording' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pause Recording' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resume Recording' })).not.toBeInTheDocument();
  });

  it('calls onStartRecording when "Start Recording" button is clicked', async () => {
    render(
      <RecordingControls
        isRecording={false}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={false}
        disabled={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Start Recording' }));
    expect(mockOnStartRecording).toHaveBeenCalledTimes(1);
  });

  it('renders "Pause Recording" and "Stop Recording" buttons when recording and not paused', () => {
    render(
      <RecordingControls
        isRecording={true}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={false}
        disabled={false}
      />
    );
    expect(screen.queryByRole('button', { name: 'Start Recording' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause Recording' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop Recording' })).toBeInTheDocument();
  });

  it('calls onPauseRecording when "Pause Recording" button is clicked', async () => {
    render(
      <RecordingControls
        isRecording={true}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={false}
        disabled={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Pause Recording' }));
    expect(mockOnPauseRecording).toHaveBeenCalledTimes(1);
  });

  it('calls onStopRecording when "Stop Recording" button is clicked', async () => {
    render(
      <RecordingControls
        isRecording={true}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={false}
        disabled={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Stop Recording' }));
    expect(mockOnStopRecording).toHaveBeenCalledTimes(1);
  });

  it('renders "Resume Recording" and "Stop Recording" buttons when recording and paused', () => {
    render(
      <RecordingControls
        isRecording={true}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={true}
        disabled={false}
      />
    );
    expect(screen.queryByRole('button', { name: 'Start Recording' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pause Recording' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume Recording' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stop Recording' })).toBeInTheDocument();
  });

  it('calls onResumeRecording when "Resume Recording" button is clicked', async () => {
    render(
      <RecordingControls
        isRecording={true}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={true}
        disabled={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Resume Recording' }));
    expect(mockOnResumeRecording).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <RecordingControls
        isRecording={false}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={false}
        disabled={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Start Recording' })).toBeDisabled();

    // Rerender with recording state to check other buttons
    render(
      <RecordingControls
        isRecording={true}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={false}
        disabled={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Pause Recording' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Stop Recording' })).toBeDisabled();

    render(
      <RecordingControls
        isRecording={true}
        onStartRecording={mockOnStartRecording}
        onStopRecording={mockOnStopRecording}
        onPauseRecording={mockOnPauseRecording}
        onResumeRecording={mockOnResumeRecording}
        isPaused={true}
        disabled={true}
      />
    );
    expect(screen.getByRole('button', { name: 'Resume Recording' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Stop Recording' })).toBeDisabled();
  });
});
