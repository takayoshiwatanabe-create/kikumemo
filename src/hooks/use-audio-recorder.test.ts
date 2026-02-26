import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder } from './use-audio-recorder';

// Mock MediaRecorder and related APIs
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();
const mockAddEventListener = vi.fn((event, callback) => {
  if (event === 'dataavailable') {
    mockDataAvailableCallback = callback;
  }
  if (event === 'stop') {
    mockStopCallback = callback;
  }
  if (event === 'error') {
    mockErrorCallback = callback;
  }
});
const mockRemoveEventListener = vi.fn();
const mockMediaRecorder = {
  start: mockStart,
  stop: mockStop,
  pause: mockPause,
  resume: mockResume,
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  state: 'inactive',
  mimeType: 'audio/webm',
};

let mockDataAvailableCallback: ((event: { data: Blob }) => void) | undefined;
let mockStopCallback: (() => void) | undefined;
let mockErrorCallback: ((event: { error: Error }) => void) | undefined;

const mockMediaStream = {
  getTracks: () => [{ stop: vi.fn() }],
};

global.MediaRecorder = vi.fn(() => mockMediaRecorder) as any;
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve(mockMediaStream)),
} as any;

describe('useAudioRecorder', () => {
  const onDataAvailable = vi.fn();
  const onStop = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockMediaRecorder.state = 'inactive'; // Reset state for each test
  });

  afterEach(() => {
    mockDataAvailableCallback = undefined;
    mockStopCallback = undefined;
    mockErrorCallback = undefined;
  });

  it('initializes with correct state', () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));
    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('starts recording successfully', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(global.MediaRecorder).toHaveBeenCalledWith(mockMediaStream, { mimeType: 'audio/webm' });
    expect(mockAddEventListener).toHaveBeenCalledWith('dataavailable', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('stop', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockStart).toHaveBeenCalledWith(500); // Default timeslice
    expect(result.current.isRecording).toBe(true);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('stops recording successfully', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
      mockMediaRecorder.state = 'recording'; // Simulate recording state
      await result.current.stop();
    });

    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockRemoveEventListener).toHaveBeenCalledWith('dataavailable', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('stop', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockMediaStream.getTracks()[0].stop).toHaveBeenCalledTimes(1);
    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('pauses recording successfully', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
      mockMediaRecorder.state = 'recording';
      await result.current.pause();
    });

    expect(mockPause).toHaveBeenCalledTimes(1);
    expect(result.current.isRecording).toBe(true); // Still recording, just paused
    expect(result.current.isPaused).toBe(true);
  });

  it('resumes recording successfully', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
      mockMediaRecorder.state = 'recording';
      await result.current.pause();
      mockMediaRecorder.state = 'paused'; // Simulate paused state
      await result.current.resume();
    });

    expect(mockResume).toHaveBeenCalledTimes(1);
    expect(result.current.isRecording).toBe(true);
    expect(result.current.isPaused).toBe(false);
  });

  it('handles dataavailable event', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
    });

    const mockBlob = new Blob(['test audio'], { type: 'audio/webm' });
    act(() => {
      if (mockDataAvailableCallback) {
        mockDataAvailableCallback({ data: mockBlob });
      }
    });

    expect(onDataAvailable).toHaveBeenCalledWith(mockBlob);
  });

  it('handles stop event', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
      mockMediaRecorder.state = 'recording';
      await result.current.stop();
    });

    const mockBlob = new Blob(['final audio'], { type: 'audio/webm' });
    act(() => {
      if (mockDataAvailableCallback) {
        mockDataAvailableCallback({ data: mockBlob }); // Simulate final data chunk
      }
      if (mockStopCallback) {
        mockStopCallback();
      }
    });

    expect(onStop).toHaveBeenCalledWith(mockBlob); // Expect the final combined blob
  });

  it('handles error event', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
    });

    const mockError = new Error('Microphone access denied');
    act(() => {
      if (mockErrorCallback) {
        mockErrorCallback({ error: mockError });
      }
    });

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(result.current.error).toBe('Microphone access denied');
    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
  });

  it('sets error state if getUserMedia fails', async () => {
    (navigator.mediaDevices.getUserMedia as vi.Mock).mockRejectedValueOnce(new Error('Permission denied'));
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.error).toBe('Permission denied');
    expect(onError).toHaveBeenCalledWith(new Error('Permission denied'));
    expect(result.current.isRecording).toBe(false);
  });

  it('does not start if already recording', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.start();
      mockStart.mockClear(); // Clear previous call
      await result.current.start(); // Try to start again
    });

    expect(mockStart).not.toHaveBeenCalled();
  });

  it('does not stop if not recording', async () => {
    const { result } = renderHook(() => useAudioRecorder({ onDataAvailable, onStop, onError }));

    await act(async () => {
      await result.current.stop();
    });

    expect(mockStop).not.toHaveBeenCalled();
  });
});
