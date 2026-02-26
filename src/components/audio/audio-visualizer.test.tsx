import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AudioVisualizer from './audio-visualizer';
import { AudioVisualizerMessage } from '@/types';

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn((cb) => {
  // Simulate immediate execution for testing purposes, or store for manual trigger
  return setTimeout(cb, 0);
});
const mockCancelAnimationFrame = vi.fn((id) => clearTimeout(id));

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

describe('AudioVisualizer', () => {
  let mockCanvasContext: CanvasRenderingContext2D;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Mock canvas and its context
    mockCanvasContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: '',
      canvas: {
        width: 500,
        height: 200,
      },
    } as unknown as CanvasRenderingContext2D;

    mockCanvas = {
      getContext: vi.fn(() => mockCanvasContext),
      width: 500,
      height: 200,
    } as unknown as HTMLCanvasElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the canvas element', () => {
    render(<AudioVisualizer audioData={null} isRecording={false} />);
    expect(screen.getByTestId('motion-div').querySelector('canvas')).toBeInTheDocument();
  });

  it('does not draw anything when not recording', () => {
    render(<AudioVisualizer audioData={null} isRecording={false} />);
    expect(mockCanvas.getContext).not.toHaveBeenCalled();
    expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
  });

  it('clears canvas and stops animation when recording stops', async () => {
    const mockAudioData: AudioVisualizerMessage = {
      type: 'audio_data',
      sessionId: '123',
      frequencies: [0.1, 0.2, 0.3],
      volume: 0.5,
    };

    const { rerender } = render(<AudioVisualizer audioData={mockAudioData} isRecording={true} />);

    // Expect drawing to start
    expect(mockRequestAnimationFrame).toHaveBeenCalled();

    // Stop recording
    rerender(<AudioVisualizer audioData={null} isRecording={false} />);

    // Expect animation to be cancelled and canvas cleared
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
    await vi.runAllTimersAsync(); // Allow the setTimeout in mockRequestAnimationFrame to resolve
    expect(mockCanvasContext.clearRect).toHaveBeenCalledWith(0, 0, 500, 200);
  });

  it('draws frequencies on the canvas when recording and audioData is present', async () => {
    const mockAudioData: AudioVisualizerMessage = {
      type: 'audio_data',
      sessionId: '123',
      frequencies: [0.1, 0.5, 0.9],
      volume: 0.7,
    };

    render(<AudioVisualizer audioData={mockAudioData} isRecording={true} />);

    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockRequestAnimationFrame).toHaveBeenCalled();

    // Manually run the animation frame callback
    await vi.runAllTimersAsync();

    expect(mockCanvasContext.clearRect).toHaveBeenCalledWith(0, 0, 500, 200);
    expect(mockCanvasContext.fillRect).toHaveBeenCalledTimes(mockAudioData.frequencies.length);

    // Check specific fillRect calls (example for one bar)
    const height = mockCanvas.height;
    const width = mockCanvas.width;
    const barWidth = width / mockAudioData.frequencies.length;

    // First bar
    expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(
      0,
      height - mockAudioData.frequencies[0] * height,
      barWidth - 1,
      mockAudioData.frequencies[0] * height
    );

    // Second bar
    expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(
      barWidth,
      height - mockAudioData.frequencies[1] * height,
      barWidth - 1,
      mockAudioData.frequencies[1] * height
    );

    // Third bar
    expect(mockCanvasContext.fillRect).toHaveBeenCalledWith(
      barWidth * 2,
      height - mockAudioData.frequencies[2] * height,
      barWidth - 1,
      mockAudioData.frequencies[2] * height
    );

    // Check fillStyle based on volume
    const expectedHue = 200 + mockAudioData.volume * 100;
    const expectedSaturation = 70 + mockAudioData.volume * 30;
    const expectedLightness = 50 + mockAudioData.volume * 10;
    expect(mockCanvasContext.fillStyle).toBe(`hsl(${expectedHue}, ${expectedSaturation}%, ${expectedLightness}%)`);
  });

  it('updates volume state based on audioData', async () => {
    const mockAudioData1: AudioVisualizerMessage = {
      type: 'audio_data',
      sessionId: '123',
      frequencies: [0.1],
      volume: 0.2,
    };
    const mockAudioData2: AudioVisualizerMessage = {
      type: 'audio_data',
      sessionId: '123',
      frequencies: [0.8],
      volume: 0.9,
    };

    const { rerender } = render(<AudioVisualizer audioData={mockAudioData1} isRecording={true} />);
    await vi.runAllTimersAsync(); // Allow useEffect to run

    // Check initial volume (indirectly via AudioAurora mock)
    // AudioAurora is mocked, so we check the prop passed to it
    expect(screen.getByTestId('motion-div')).toHaveAttribute('custom', '0.2');

    rerender(<AudioVisualizer audioData={mockAudioData2} isRecording={true} />);
    await vi.runAllTimersAsync(); // Allow useEffect to run

    // Check updated volume
    expect(screen.getByTestId('motion-div')).toHaveAttribute('custom', '0.9');
  });
});
