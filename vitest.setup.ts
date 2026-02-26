import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend Vitest's expect with methods from react-testing-library
// This is automatically done by '@testing-library/jest-dom' import

// Runs cleanup after each test file
afterEach(() => {
  cleanup();
});

// Mock for MediaRecorder and related APIs
class MockMediaRecorder {
  static isTypeSupported = vi.fn((type) => true);
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((event: { error: Error }) => void) | null = null;
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  mimeType: string;
  stream: MediaStream;

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    this.stream = stream;
    this.mimeType = options?.mimeType || 'audio/webm';
    vi.spyOn(this, 'start');
    vi.spyOn(this, 'stop');
    vi.spyOn(this, 'pause');
    vi.spyOn(this, 'resume');
  }

  start(timeslice?: number) {
    this.state = 'recording';
    // Simulate data available after a short delay
    setTimeout(() => {
      if (this.state === 'recording' && this.ondataavailable) {
        const mockBlob = new Blob(['mock audio data'], { type: this.mimeType });
        this.ondataavailable({ data: mockBlob });
      }
    }, 100);
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }
}

class MockMediaStream {
  getTracks = vi.fn(() => [{ stop: vi.fn() }]);
}

class MockAudioContext {
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
  }));
  createAnalyser = vi.fn(() => ({
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
  }));
  destination = {};
  state = 'running';
  resume = vi.fn();
  close = vi.fn();
}

class MockAnalyserNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  getByteFrequencyData = vi.fn();
}

beforeAll(() => {
  // Mock MediaRecorder
  window.MediaRecorder = MockMediaRecorder as any;

  // Mock navigator.mediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn(() => Promise.resolve(new MockMediaStream())),
    },
  });

  // Mock AudioContext
  window.AudioContext = MockAudioContext as any;
  window.webkitAudioContext = MockAudioContext as any; // For Safari compatibility

  // Mock AnalyserNode
  window.AnalyserNode = MockAnalyserNode as any;
});

afterAll(() => {
  vi.restoreAllMocks();
});
