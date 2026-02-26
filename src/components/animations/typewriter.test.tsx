import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Typewriter from './typewriter';
import { motion } from 'framer-motion';

// Mock framer-motion's motion component to inspect its props
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof motion>();
  return {
    ...actual,
    motion: {
      span: vi.fn((props) => <span {...props} data-testid="motion-span" />),
    },
  };
});

describe('Typewriter', () => {
  it('renders the provided text character by character', async () => {
    const testText = 'Hello';
    render(<Typewriter text={testText} />);

    // Check that each character is rendered within a motion.span
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('e')).toBeInTheDocument();
    expect(screen.getByText('l')).toBeInTheDocument();
    expect(screen.getByText('l')).toBeInTheDocument();
    expect(screen.getByText('o')).toBeInTheDocument();

    // Ensure the parent motion.span is called with the correct variants
    expect(motion.span).toHaveBeenCalledWith(
      expect.objectContaining({
        initial: 'hidden',
        animate: 'visible',
        variants: expect.any(Object), // Expects the TypewriterVariants object
      }),
      {}
    );

    // Ensure each character span is called with its own variants
    expect(motion.span).toHaveBeenCalledWith(
      expect.objectContaining({
        variants: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
      }),
      {}
    );
  });

  it('applies the provided className to the container span', () => {
    const testText = 'Test';
    const testClassName = 'text-lg font-semibold';
    render(<Typewriter text={testText} className={testClassName} />);

    // The first call to motion.span should be for the container
    expect(motion.span).toHaveBeenCalledWith(
      expect.objectContaining({
        className: testClassName,
      }),
      {}
    );
  });

  it('uses default delay and stagger values if not provided', () => {
    const testText = 'ABC';
    render(<Typewriter text={testText} />);

    // Check the variants object passed to the container motion.span
    expect(motion.span).toHaveBeenCalledWith(
      expect.objectContaining({
        variants: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.03, // Default stagger
              delayChildren: 0.5, // Default delay
            },
          },
        },
      }),
      {}
    );
  });

  it('uses custom delay and stagger values if provided', () => {
    const testText = 'XYZ';
    render(<Typewriter text={testText} delay={1.0} stagger={0.1} />);

    // Check the variants object passed to the container motion.span
    expect(motion.span).toHaveBeenCalledWith(
      expect.objectContaining({
        variants: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1, // Custom stagger
              delayChildren: 1.0, // Custom delay
            },
          },
        },
      }),
      {}
    );
  });
});
