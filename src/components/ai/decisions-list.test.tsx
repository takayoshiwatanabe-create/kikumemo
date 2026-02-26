import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DecisionsList from './decisions-list';
import { useI18n } from '@/i18n';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

describe('DecisionsList', () => {
  beforeEach(() => {
    // Default mock for useI18n
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key, // Simple passthrough for translation keys
      lang: 'en',
      isRTL: false,
    });
  });

  it('renders an empty list if no decisions are provided', () => {
    render(<DecisionsList decisions={[]} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children.length).toBe(0);
  });

  it('renders a list of decisions', () => {
    const decisions = ['Decision 1: Approved budget for Q3.', 'Decision 2: Hired new marketing lead.'];
    render(<DecisionsList decisions={decisions} />);

    expect(screen.getByText('Decision 1: Approved budget for Q3.')).toBeInTheDocument();
    expect(screen.getByText('Decision 2: Hired new marketing lead.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('applies RTL class when isRTL is true', () => {
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key,
      lang: 'ar',
      isRTL: true,
    });
    const decisions = ['قرار 1', 'قرار 2'];
    render(<DecisionsList decisions={decisions} />);

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
    const decisions = ['Decision 1', 'Decision 2'];
    render(<DecisionsList decisions={decisions} />);

    const list = screen.getByRole('list');
    expect(list).not.toHaveClass('rtl');
    expect(list).toHaveClass('text-left');
  });
});
