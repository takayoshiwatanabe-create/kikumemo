import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import KeyPointsList from './key-points-list';
import { useI18n } from '@/i18n';

// Mock the i18n hook
vi.mock('@/i18n', () => ({
  useI18n: vi.fn(),
}));

describe('KeyPointsList', () => {
  beforeEach(() => {
    // Default mock for useI18n
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key, // Simple passthrough for translation keys
      lang: 'en',
      isRTL: false,
    });
  });

  it('renders an empty list if no points are provided', () => {
    render(<KeyPointsList points={[]} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.children.length).toBe(0);
  });

  it('renders a list of key points', () => {
    const points = ['Introduced new feature set.', 'Discussed Q4 marketing strategy.', 'Reviewed budget allocations.'];
    render(<KeyPointsList points={points} />);

    expect(screen.getByText('Introduced new feature set.')).toBeInTheDocument();
    expect(screen.getByText('Discussed Q4 marketing strategy.')).toBeInTheDocument();
    expect(screen.getByText('Reviewed budget allocations.')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('applies RTL class when isRTL is true', () => {
    (useI18n as vi.Mock).mockReturnValue({
      t: (key: string) => key,
      lang: 'ar',
      isRTL: true,
    });
    const points = ['نقطة 1', 'نقطة 2'];
    render(<KeyPointsList points={points} />);

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
    const points = ['Point 1', 'Point 2'];
    render(<KeyPointsList points={points} />);

    const list = screen.getByRole('list');
    expect(list).not.toHaveClass('rtl');
    expect(list).toHaveClass('text-left');
  });
});
