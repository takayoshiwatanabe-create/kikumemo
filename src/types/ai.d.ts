// src/types/ai.d.ts

// Define types for AI-related data structures as per CLAUDE.md

export interface TodoItem {
  assignee: string;
  task: string;
  deadline?: string; // YYYY-MM-DD format
  priority: 'high' | 'medium' | 'low';
}

export interface SummarizeRequest {
  transcript: string;
  userNotes: string;
  language: string;
  meetingContext?: string;
}

export interface SummarizeResponse {
  summary: string;
  keyPoints: string[];
  todos: TodoItem[];
  decisions: string[];
  openIssues: string[];
}

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
