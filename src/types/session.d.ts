// This file is specifically for session-related types.
// It complements the main `types/index.ts` by providing more granular definitions
// if needed, or can be merged into `types/index.ts` if preferred for simplicity.
 
import { Language } from '@/i18n/translations'; // Assuming Language type is defined here, as per design

// Recording Session
export interface RecordingSession {
  id: string;
  userId: string;
  title: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  audio_file_path?: string | null;
  transcript?: string | null;
  user_notes?: string | null;
  ai_summary?: string | null;
  duration_seconds: number;
  language_code: Language; // Use the Language type from i18n
  createdAt: Date;
  updatedAt?: Date | null;
}

// AI Generated Content
export type AIType = 'summary' | 'todos' | 'key_points' | 'decisions' | 'open_issues';

export interface AIOutput {
  id: string;
  sessionId: string;
  type: AIType;
  content: string;
  confidence_score?: number | null;
  created_at: Date;
}

export interface AISummaryResponse {
  summary: string;
  keyPoints: string[];
  todos: Array<{
    assignee: string;
    deadline?: string;
    task: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  decisions: string[];
  openIssues: string[];
}

// WebSocket Messages
export interface RealtimeTranscriptMessage {
  type: 'transcript_chunk';
  sessionId: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface AudioVisualizerMessage {
  type: 'audio_data';
  sessionId: string;
  frequencies: number[];
  volume: number;
}

// Audio Data (for frontend state)
export interface AudioData {
  buffer?: Float32Array;
  volume?: number;
  frequencies?: number[];
}

