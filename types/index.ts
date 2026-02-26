// User Management
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null; // avatar_url can be null
  subscription_plan: 'free' | 'monthly' | 'yearly';
  subscription_expires?: Date | null; // subscription_expires can be null
  created_at: Date;
  updated_at?: Date | null; // updated_at can be null
}

export interface SubscriptionInfo {
  plan: 'free' | 'monthly' | 'yearly';
  expiresAt?: Date;
  // Add other subscription details like renewal date, payment method etc.
}

export interface UsageStats {
  meetingsGenerated: number;
  freeMeetingsLeft: number;
  totalDurationMinutes: number;
}

// Recording Session
export interface RecordingSession {
  id: string;
  userId: string;
  title: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  audio_file_path?: string | null; // Can be null
  transcript?: string | null; // Can be null
  user_notes?: string | null; // Can be null
  ai_summary?: string | null; // Can be null
  duration_seconds: number; // Corrected to match DB schema
  language_code: string;
  createdAt: Date;
  updatedAt?: Date | null; // Can be null
}

// AI Generated Content
export type AIType = 'summary' | 'todos' | 'key_points' | 'decisions' | 'open_issues';

export interface AIOutput {
  id: string;
  sessionId: string;
  type: AIType;
  content: string;
  confidence_score?: number | null; // Can be null
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

// User Preferences
export interface UserPreferences {
  user_id?: string; // Optional as it might be part of the User object or implicit
  language: string;
  timezone: string;
  audioQuality: 'standard' | 'high';
  autoSave: boolean;
  exportFormat: 'markdown' | 'docx' | 'pdf';
}

// API Request/Response Types (Frontend perspective)
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  language?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface CreateSessionRequest {
  title: string;
  language?: string;
}

export interface UploadAudioRequest {
  audioBlob: Blob; // For web, File for RN
  userNotes?: string;
}

export interface SessionStatusResponse {
  id: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  progress?: number; // e.g., 0-100
  transcript?: string;
  aiSummary?: string;
}

export interface ProcessRequest {
  transcript: string;
  userNotes: string;
  language: string;
}

export interface SummarizeRequest {
  transcript: string;
  userNotes: string;
  language: string;
  meetingContext?: string;
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
  // Define structure for audio data if needed for visualization or processing in frontend
  // e.g., raw PCM data, frequency bins, volume levels
  buffer?: Float32Array;
  volume?: number;
  frequencies?: number[];
}



