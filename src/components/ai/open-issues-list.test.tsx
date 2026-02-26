import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OpenIssuesList from './open-issues-list';
import { useI18n } from '@/i18n';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

describe('OpenIssuesList', () => {
  beforeEach(() => {
    // Default mock for useI18n
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key, // Simple passthrough for translation keys
      lang: 'en',
      isRTL: false,
    });
  });

  it('renders an empty list if no issues are provided', () => {
    render(<OpenIssuesList issues={[]} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children.length).toBe(0);
  });

  it('renders a list of open issues', () => {
    const issues = ['Issue 1: Pending client feedback.', 'Issue 2: Resource allocation for next sprint.'];
    render(<OpenIssuesList issues={issues} />);

    expect(screen.getByText('Issue 1: Pending client feedback.')).toBeInTheDocument();
    expect(screen.getByText('Issue 2: Resource allocation for next sprint.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('applies RTL class when isRTL is true', () => {
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key,
      lang: 'ar',
      isRTL: true,
    });
    const issues = ['مشكلة 1', 'مشكلة 2'];
    render(<OpenIssuesList issues={issues} />);

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
    const issues = ['Issue 1', 'Issue 2'];
    render(<OpenIssuesList issues={issues} />);

    const list = screen.getByRole('list');
    expect(list).not.toHaveClass('rtl');
    expect(list).toHaveClass('text-left');
  });
});
