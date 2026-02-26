import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RealtimeTranscript from './realtime-transcript';
import { useI18n } from '@/i18n';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'record.realtimeTranscript': 'Real-time Transcript',
        'record.listening': 'Listening',
        'record.processingAudio': 'Processing Audio',
        'record.startRecordingPrompt': 'Click start to begin recording.',
      };
      return translations[key] || key;
    },
    lang: 'en',
    isRTL: false,
  }),
}));

describe('RealtimeTranscript', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Click start to begin recording." when not recording and not processing', () => {
    render(<RealtimeTranscript transcript="" isRecording={false} isProcessing={false} />);
    expect(screen.getByText('Real-time Transcript')).toBeInTheDocument();
    expect(screen.getByText('Click start to begin recording.')).toBeInTheDocument();
  });

  it('renders "Listening..." when recording and not paused', () => {
    render(<RealtimeTranscript transcript="" isRecording={true} isProcessing={false} />);
    expect(screen.getByText('Real-time Transcript')).toBeInTheDocument();
    expect(screen.getByText('Listening...')).toBeInTheDocument();
  });

  it('renders "Processing Audio..." when processing', () => {
    render(<RealtimeTranscript transcript="" isRecording={false} isProcessing={true} />);
    expect(screen.getByText('Real-time Transcript')).toBeInTheDocument();
    expect(screen.getByText('Processing Audio...')).toBeInTheDocument();
  });

  it('renders the provided transcript when recording', () => {
    const mockTranscript = "This is a real-time transcript chunk.";
    render(<RealtimeTranscript transcript={mockTranscript} isRecording={true} isProcessing={false} />);
    expect(screen.getByText('Real-time Transcript')).toBeInTheDocument();
    expect(screen.getByText(mockTranscript)).toBeInTheDocument();
  });

  it('renders the provided transcript when processing', () => {
    const mockTranscript = "This is a transcript being processed.";
    render(<RealtimeTranscript transcript={mockTranscript} isRecording={false} isProcessing={true} />);
    expect(screen.getByText('Real-time Transcript')).toBeInTheDocument();
    expect(screen.getByText(mockTranscript)).toBeInTheDocument();
  });

  it('displays the transcript with correct RTL direction when isRTL is true', () => {
    vi.mocked(useI18n).mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'record.realtimeTranscript': 'Real-time Transcript',
          'record.listening': 'Listening',
          'record.processingAudio': 'Processing Audio',
          'record.startRecordingPrompt': 'Click start to begin recording.',
        };
        return translations[key] || key;
      },
      lang: 'ar',
      isRTL: true,
    });

    const mockTranscript = "هذا هو نص في الوقت الحقيقي.";
    render(<RealtimeTranscript transcript={mockTranscript} isRecording={true} isProcessing={false} />);

    const transcriptDiv = screen.getByText(mockTranscript);
    expect(transcriptDiv).toBeInTheDocument();
    expect(transcriptDiv).toHaveClass('text-right');
    expect(transcriptDiv).toHaveClass('rtl');
  });

  it('displays the transcript with correct LTR direction when isRTL is false', () => {
    vi.mocked(useI18n).mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'record.realtimeTranscript': 'Real-time Transcript',
          'record.listening': 'Listening',
          'record.processingAudio': 'Processing Audio',
          'record.startRecordingPrompt': 'Click start to begin recording.',
        };
        return translations[key] || key;
      },
      lang: 'en',
      isRTL: false,
    });

    const mockTranscript = "This is a real-time transcript.";
    render(<RealtimeTranscript transcript={mockTranscript} isRecording={true} isProcessing={false} />);

    const transcriptDiv = screen.getByText(mockTranscript);
    expect(transcriptDiv).toBeInTheDocument();
    expect(transcriptDiv).toHaveClass('text-left');
    expect(transcriptDiv).toHaveClass('ltr');
  });
});

