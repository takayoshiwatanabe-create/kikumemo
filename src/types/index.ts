import { Language } from "@/i18n";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  subscription_plan: "free" | "monthly" | "yearly";
  subscription_expires?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface RecordingSession {
  id: string;
  userId: string;
  title: string;
  status: "recording" | "processing" | "completed" | "failed";
  audio_file_path?: string | null;
  transcript?: string | null;
  user_notes?: string | null;
  ai_summary?: string | null;
  duration_seconds: number;
  language_code: Language;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIOutput {
  id: string;
  sessionId: string;
  type: "summary" | "todos" | "key_points" | "decisions" | "open_issues";
  content: string;
  confidence_score?: number | null;
  created_at: Date;
}

export interface UserPreferences {
  language: Language;
  timezone: string;
  audioQuality: "standard" | "high";
  autoSave: boolean;
  exportFormat: "markdown" | "docx" | "pdf";
}

// API Request/Response Types
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  language?: Language;
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
  language?: Language;
}

export interface UploadAudioRequest {
  audioBlob: File;
  userNotes?: string;
}

export interface SessionStatusResponse {
  id: string;
  status: "recording" | "processing" | "completed" | "failed";
  progress?: number;
  transcript?: string;
  aiSummary?: string;
}

export interface ProcessRequest {
  transcript: string;
  userNotes: string;
  language: Language;
}

export interface SummarizeRequest {
  transcript: string;
  userNotes: string;
  language: Language;
  meetingContext?: string;
}

export interface TodoItem {
  assignee: string;
  task: string;
  deadline?: string;
  priority: "high" | "medium" | "low";
}

export interface AISummaryResponse {
  summary: string;
  keyPoints: string[];
  todos: TodoItem[];
  decisions: string[];
  openIssues: string[];
}

// WebSocket Types
export interface RealtimeTranscriptMessage {
  type: "transcript_chunk";
  sessionId: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface AudioVisualizerMessage {
  type: "audio_data";
  sessionId: string;
  frequencies: number[];
  volume: number;
}


