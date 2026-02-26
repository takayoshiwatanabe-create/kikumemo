import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AudioAurora from './audio-aurora';
import { motion } from 'framer-motion';

// Mock framer-motion's motion component to inspect its props
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof motion>();
  return {
    ...actual,
    motion: {
      div: vi.fn((props) => <div {...props} data-testid="motion-div" />),
    },
  };
});

describe('AudioAurora', () => {
  it('renders with idle animation when not recording', () => {
    render(<AudioAurora isRecording={false} volume={0} />);
    expect(motion.div).toHaveBeenCalledWith(
      expect.objectContaining({
        animate: 'idle',
        custom: 0,
      }),
      {}
    );
  });

  it('renders with active animation and custom volume when recording', () => {
    const volume = 0.5;
    render(<AudioAurora isRecording={true} volume={volume} />);
    expect(motion.div).toHaveBeenCalledWith(
      expect.objectContaining({
        animate: 'active',
        custom: volume,
      }),
      {}
    );
  });

  it('passes correct class names', () => {
    render(<AudioAurora isRecording={false} volume={0} />);
    expect(motion.div).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50',
      }),
      {}
    );
  });
});
