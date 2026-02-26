import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SummaryDisplay from './summary-display';
import { useI18n } from '@/i18n';
import { AISummaryResponse } from '@/types';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

// Mock child components
vi.mock('./key-points-list', () => ({
  default: ({ points }: { points: string[] }) => (
    <div data-testid="key-points-list">Key Points: {points.join(', ')}</div>
  ),
}));
vi.mock('./todo-list', () => ({
  default: ({ todos }: { todos: any[] }) => (
    <div data-testid="todo-list">To-Dos: {todos.map(t => t.task).join(', ')}</div>
  ),
}));
vi.mock('./decisions-list', () => ({
  default: ({ decisions }: { decisions: string[] }) => (
    <div data-testid="decisions-list">Decisions: {decisions.join(', ')}</div>
  ),
}));
vi.mock('./open-issues-list', () => ({
  default: ({ issues }: { issues: string[] }) => (
    <div data-testid="open-issues-list">Open Issues: {issues.join(', ')}</div>
  ),
}));

describe('SummaryDisplay', () => {
  beforeEach(() => {
    // Default mock for useI18n
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'common.loading': 'Loading...',
          'common.error': 'Error',
          'record.processingAudio': 'Processing Audio',
          'session.noSummaryAvailable': 'No AI summary available yet.',
          'session.aiSummary': 'AI Summary',
          'session.keyPoints': 'Key Points',
          'session.todos': 'To-Dos',
          'session.decisions': 'Decisions',
          'session.openIssues': 'Open Issues',
        };
        return translations[key] || key;
      },
      lang: 'en',
      isRTL: false,
    });
  });

  it('renders loading state when isLoading is true', async () => {
    render(<SummaryDisplay summary={null} isLoading={true} />);
    await waitFor(() => {
      expect(screen.getByText('Processing Audio...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('renders error message when error is provided', () => {
    render(<SummaryDisplay summary={null} isLoading={false} error="Failed to fetch summary" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch summary')).toBeInTheDocument();
  });

  it('renders "No AI summary available yet." when no summary is provided and not loading/error', () => {
    render(<SummaryDisplay summary={null} isLoading={false} />);
    expect(screen.getByText('No AI summary available yet.')).toBeInTheDocument();
  });

  it('renders the main summary when provided', () => {
    const mockSummary: AISummaryResponse = {
      summary: 'This is a comprehensive summary of the meeting.',
      keyPoints: [],
      todos: [],
      decisions: [],
      openIssues: [],
    };
    render(<SummaryDisplay summary={mockSummary} isLoading={false} />);
    expect(screen.getByText('AI Summary')).toBeInTheDocument();
    expect(screen.getByText('This is a comprehensive summary of the meeting.')).toBeInTheDocument();
  });

  it('renders KeyPointsList when keyPoints are available', () => {
    const mockSummary: AISummaryResponse = {
      summary: 'Summary text.',
      keyPoints: ['Point A', 'Point B'],
      todos: [],
      decisions: [],
      openIssues: [],
    };
    render(<SummaryDisplay summary={mockSummary} isLoading={false} />);
    expect(screen.getByText('Key Points')).toBeInTheDocument();
    expect(screen.getByTestId('key-points-list')).toHaveTextContent('Key Points: Point A, Point B');
  });

  it('renders TodoList when todos are available', () => {
    const mockSummary: AISummaryResponse = {
      summary: 'Summary text.',
      keyPoints: [],
      todos: [{ assignee: 'Alice', task: 'Task 1', priority: 'high' }],
      decisions: [],
      openIssues: [],
    };
    render(<SummaryDisplay summary={mockSummary} isLoading={false} />);
    expect(screen.getByText('To-Dos')).toBeInTheDocument();
    expect(screen.getByTestId('todo-list')).toHaveTextContent('To-Dos: Task 1');
  });

  it('renders DecisionsList when decisions are available', () => {
    const mockSummary: AISummaryResponse = {
      summary: 'Summary text.',
      keyPoints: [],
      todos: [],
      decisions: ['Decision X', 'Decision Y'],
      openIssues: [],
    };
    render(<SummaryDisplay summary={mockSummary} isLoading={false} />);
    expect(screen.getByText('Decisions')).toBeInTheDocument();
    expect(screen.getByTestId('decisions-list')).toHaveTextContent('Decisions: Decision X, Decision Y');
  });

  it('renders OpenIssuesList when openIssues are available', () => {
    const mockSummary: AISummaryResponse = {
      summary: 'Summary text.',
      keyPoints: [],
      todos: [],
      decisions: [],
      openIssues: ['Issue P', 'Issue Q'],
    };
    render(<SummaryDisplay summary={mockSummary} isLoading={false} />);
    expect(screen.getByText('Open Issues')).toBeInTheDocument();
    expect(screen.getByTestId('open-issues-list')).toHaveTextContent('Open Issues: Issue P, Issue Q');
  });

  it('applies RTL class to container when isRTL is true', () => {
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key,
      lang: 'ar',
      isRTL: true,
    });
    const mockSummary: AISummaryResponse = {
      summary: 'ملخص الاجتماع',
      keyPoints: [],
      todos: [],
      decisions: [],
      openIssues: [],
    };
    render(<SummaryDisplay summary={mockSummary} isLoading={false} />);

    const container = screen.getByText('AI Summary').closest('div');
    expect(container).toHaveClass('rtl');
    expect(container).toHaveClass('text-right');
  });

  it('does not apply RTL class to container when isRTL is false', () => {
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key,
      lang: 'en',
      isRTL: false,
    });
    const mockSummary: AISummaryResponse = {
      summary: 'Meeting summary',
      keyPoints: [],
      todos: [],
      decisions: [],
      openIssues: [],
    };
    render(<SummaryDisplay summary={mockSummary} isLoading={false} />);

    const container = screen.getByText('AI Summary').closest('div');
    expect(container).not.toHaveClass('rtl');
    expect(container).toHaveClass('text-left');
  });
});
