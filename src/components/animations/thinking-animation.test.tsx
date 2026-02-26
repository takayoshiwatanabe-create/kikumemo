import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThinkingAnimation from './thinking-animation';
import { motion } from 'framer-motion';

// Mock framer-motion's motion component to inspect its props
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof motion>();
  return {
    ...actual,
    motion: {
      p: vi.fn((props) => <p {...props} data-testid="motion-p" />),
    },
  };
});

describe('ThinkingAnimation', () => {
  it('renders the provided text', () => {
    const testText = 'Thinking...';
    render(<ThinkingAnimation text={testText} />);
    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('applies the provided className', () => {
    const testText = 'Processing...';
    const testClassName = 'text-blue-500 font-bold';
    render(<ThinkingAnimation text={testText} className={testClassName} />);
    expect(motion.p).toHaveBeenCalledWith(
      expect.objectContaining({
        className: testClassName,
      }),
      {}
    );
  });

  it('applies the correct framer-motion props', () => {
    const testText = 'Loading...';
    render(<ThinkingAnimation text={testText} />);
    expect(motion.p).toHaveBeenCalledWith(
      expect.objectContaining({
        initial: 'initial',
        animate: 'animate',
        variants: expect.any(Object), // Expects the ThinkingVariants object
      }),
      {}
    );
    // Optionally, you can deeply check the variants if needed
    const expectedVariants = {
      initial: { y: 20, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: "reverse",
        },
      },
    };
    expect(motion.p).toHaveBeenCalledWith(
      expect.objectContaining({
        variants: expectedVariants,
      }),
      {}
    );
  });
});
