import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoList from './todo-list';
import { useI18n, Language } from '@/i18n';
import { AITodoItem } from '@/types';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

describe('TodoList', () => {
  beforeEach(() => {
    // Default mock for useI18n
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => {
        const translations: Record<string, string> = {
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
    });
  });

  it('renders an empty list if no todos are provided', () => {
    render(<TodoList todos={[]} lang="en" />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children.length).toBe(0);
  });

  it('renders a list of todos with all details', () => {
    const todos: AITodoItem[] = [
      { assignee: 'Alice', task: 'Review Q1 report', deadline: '2023-12-31', priority: 'high' },
      { assignee: 'Bob', task: 'Schedule follow-up meeting', priority: 'medium' },
      { task: 'Update documentation', deadline: '2024-01-15', priority: 'low' },
      { task: 'Brainstorm new ideas' }, // No assignee, no deadline, no priority
    ];
    render(<TodoList todos={todos} lang="en" />);

    expect(screen.getByText('Review Q1 report')).toBeInTheDocument();
    expect(screen.getByText('(Assignee: Alice)')).toBeInTheDocument();
    expect(screen.getByText('Deadline: 12/31/2023')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    expect(screen.getByText('Schedule follow-up meeting')).toBeInTheDocument();
    expect(screen.getByText('(Assignee: Bob)')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.queryByText('Deadline: 12/31/2023')).not.toBeInTheDocument(); // Ensure it's specific to the first todo

    expect(screen.getByText('Update documentation')).toBeInTheDocument();
    expect(screen.getByText('Deadline: 1/15/2024')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.queryByText('(Assignee: Bob)')).not.toBeInTheDocument(); // Ensure it's specific to the second todo

    expect(screen.getByText('Brainstorm new ideas')).toBeInTheDocument();
    expect(screen.queryByText('Assignee:')).not.toBeInTheDocument();
    expect(screen.queryByText('Deadline:')).not.toBeInTheDocument();
    expect(screen.queryByText('High')).not.toBeInTheDocument();

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('formats deadline date correctly for different languages', () => {
    const todos: AITodoItem[] = [
      { assignee: 'Alice', task: 'Review Q1 report', deadline: '2023-12-31', priority: 'high' },
    ];

    render(<TodoList todos={todos} lang="ja" />);
    expect(screen.getByText('Deadline: 2023/12/31')).toBeInTheDocument();

    render(<TodoList todos={todos} lang="es" />);
    expect(screen.getByText('Deadline: 31/12/2023')).toBeInTheDocument();
  });

  it('applies correct priority classes', () => {
    const todos: AITodoItem[] = [
      { task: 'High priority task', priority: 'high' },
      { task: 'Medium priority task', priority: 'medium' },
      { task: 'Low priority task', priority: 'low' },
    ];
    render(<TodoList todos={todos} lang="en" />);

    expect(screen.getByText('High')).toHaveClass('text-red-600');
    expect(screen.getByText('Medium')).toHaveClass('text-yellow-600');
    expect(screen.getByText('Low')).toHaveClass('text-green-600');
  });

  it('applies RTL class when isRTL is true', () => {
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key,
      lang: 'ar',
      isRTL: true,
    });
    const todos: AITodoItem[] = [
      { task: 'مهمة 1', assignee: 'أحمد', priority: 'high' },
    ];
    render(<TodoList todos={todos} lang="ar" />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass('rtl');
    expect(list).toHaveClass('text-right');
  });

  it('does not apply RTL class when isRTL is false', () => {
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key,
      lang: 'en',
      isRTL: false,
    });
    const todos: AITodoItem[] = [
      { task: 'Task 1', assignee: 'John', priority: 'high' },
    ];
    render(<TodoList todos={todos} lang="en" />);

    const list = screen.getByRole('list');
    expect(list).not.toHaveClass('rtl');
    expect(list).toHaveClass('text-left');
  });
});
