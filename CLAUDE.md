# Project Design Specification

This file is the single source of truth for this project. All code must conform to this specification.

## Constitution (Project Rules)
# プロジェクト憲法（キクメモ - AI議事録生成サービス）

## 1. 核心理念（Core Philosophy）

### 1.1 プロダクトミッション
- 「書く」を邪魔せず、「記憶」を拡張する
- 機械的な処理ではなく「魔法のような体験」を提供
- ユーザーの断片的な思考を完璧な議事録に昇華

### 1.2 品質基準（Quality Standards）
- **パフォーマンス**: ページ読み込み時間 < 2秒、音声処理遅延 < 500ms
- **アクセシビリティ**: WCAG 2.1 AA準拠、キーボードナビゲーション完全対応
- **レスポンシブ**: モバイルファースト設計、全デバイス対応
- **PWA対応**: オフライン機能、プッシュ通知、インストール可能

## 2. セキュリティ・プライバシー要件

### 2.1 データ保護
- **暗号化**: 全データをAES-256で暗号化（保存時・通信時）
- **プライバシー**: AIの学習データに音声・テキストを使用禁止
- **データ保持**: ユーザー削除後24時間以内に完全削除
- **GDPR/CCPA準拠**: EU・カリフォルニア州規制対応

### 2.2 認証・認可
- **多要素認証**: SMS/Email/TOTP対応必須
- **セッション管理**: JWT + Refresh Token、自動ログアウト
- **API保護**: Rate Limiting (100req/min)、CORS適切設定

## 3. 技術制約・アーキテクチャ境界

### 3.1 技術スタック固定
- **フロントエンド**: Next.js 15 + React 19 + TypeScript
- **スタイリング**: Tailwind CSS + Framer Motion（アニメーション）
- **状態管理**: Zustand + React Query (TanStack Query v5)
- **デプロイ**: Vercel + Edge Functions

### 3.2 外部API制約
- **音声認識**: OpenAI Whisper API（主要）+ Deepgram（フォールバック）
- **AI要約**: OpenAI GPT-4 Turbo（コスト最適化）
- **ストレージ**: AWS S3 + CloudFront CDN
- **DB**: PlanetScale (MySQL) + Redis (Upstash)

### 3.3 国際化要件
- **対応言語**: 10言語（日・英・中・韓・西・仏・独・葡・アラビア・ヒンディー）
- **RTLサポート**: アラビア語対応必須
- **フォント**: Noto Sans（全言語カバー）
- **通貨**: 各地域の現地通貨表示

## 4. ビジネス制約

### 4.1 収益化モデル
- **フリーミアム**: 月5回の議事録生成無料
- **サブスクリプション**: 月額プラン・年額プラン
- **決済処理**: Stripe + PayPal国際対応

### 4.2 法的要件
- **利用規約**: 日本語・英語版必須
- **プライバシーポリシー**: GDPR・CCPA準拠
- **特定商取引法**: 日本向けサブスクリプション対応

## Design Specification
# 設計仕様書（キクメモ - AI議事録生成サービス）

## 1. システムアーキテクチャ概要

### 1.1 全体構成
```
[User Device] ↔ [CDN/Edge Cache] ↔ [Next.js App] ↔ [API Layer] ↔ [AI Services]
                                                   ↔ [Database]
                                                   ↔ [File Storage]
```

### 1.2 技術スタック詳細
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4 + Framer Motion 11
- **State**: Zustand 4.4 + TanStack Query 5.0
- **Auth**: NextAuth.js 5 + JWT
- **DB**: PlanetScale (MySQL 8.0) + Prisma ORM
- **Cache**: Redis (Upstash)
- **Storage**: AWS S3 + CloudFront
- **Deploy**: Vercel + Edge Runtime

## 2. データベース設計

### 2.1 主要テーブル構造

```sql
-- ユーザー管理
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Added password_hash for credentials provider
  avatar_url VARCHAR(500),
  subscription_plan ENUM('free', 'monthly', 'yearly') DEFAULT 'free',
  subscription_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_subscription (subscription_plan, subscription_expires)
);

-- 会議録音セッション
CREATE TABLE recording_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  status ENUM('recording', 'processing', 'completed', 'failed') DEFAULT 'recording',
  audio_file_path VARCHAR(500),
  transcript TEXT,
  user_notes TEXT,
  ai_summary TEXT,
  duration_seconds INT DEFAULT 0,
  language_code VARCHAR(10) DEFAULT 'ja',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC)
);

-- AI生成コンテンツ
CREATE TABLE ai_outputs (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  type ENUM('summary', 'todos', 'key_points', 'decisions', 'open_issues') NOT NULL, -- Added 'open_issues'
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES recording_sessions(id) ON DELETE CASCADE,
  INDEX idx_session_type (session_id, type)
);

-- ユーザー設定・多言語
CREATE TABLE user_preferences (
  user_id VARCHAR(36) PRIMARY KEY,
  language VARCHAR(10) DEFAULT 'ja',
  timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
  audio_quality ENUM('standard', 'high') DEFAULT 'standard',
  auto_save BOOLEAN DEFAULT TRUE,
  export_format ENUM('markdown', 'docx', 'pdf') DEFAULT 'markdown',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2.2 インデックス戦略
- **パフォーマンス重要**: user_id + created_at（降順）
- **検索機能**: title（全文検索インデックス）
- **分析**: subscription_plan + created_at（収益分析用）

## 3. API設計仕様

### 3.1 RESTful エンドポイント設計

#### 認証系
```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  language?: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}
```

#### セッション管理
```typescript
// POST /api/sessions/create
interface CreateSessionRequest {
  title: string;
  language?: string;
}

// POST /api/sessions/:id/upload-audio
interface UploadAudioRequest {
  audioBlob: File;
  userNotes?: string;
}

// GET /api/sessions/:id/status
interface SessionStatusResponse {
  id: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  progress?: number;
  transcript?: string;
  aiSummary?: string;
}

// POST /api/sessions/:id/process
interface ProcessRequest {
  transcript: string;
  userNotes: string;
  language: string;
}
```

#### AI処理
```typescript
// POST /api/ai/summarize
interface SummarizeRequest {
  transcript: string;
  userNotes: string;
  language: string;
  meetingContext?: string;
}

interface SummarizeResponse {
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
```

### 3.2 WebSocket仕様（リアルタイム機能）
```typescript
// リアルタイム文字起こし
interface RealtimeTranscriptMessage {
  type: 'transcript_chunk';
  sessionId: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

// 音声ビジュアライザー
interface AudioVisualizerMessage {
  type: 'audio_data';
  sessionId: string;
  frequencies: number[];
  volume: number;
}
```

## 4. フロントエンド設計

### 4.1 ディレクトリ構造
```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国際化対応
│   │   ├── dashboard/     # ダッシュボード
│   │   ├── record/        # 録音画面
│   │   ├── sessions/      # セッション管理
│   │   └── settings/      # 設定画面
│   ├── api/               # API Routes
│   └── globals.css
├── components/            # 再利用コンポーネント
│   ├── ui/               # Shadcn/ui ベース
│   ├── audio/            # 音声関連
│   ├── ai/               # AI結果表示
│   │   ├── key-points-list.tsx # キーポイントリスト
│   │   ├── todo-list.tsx       # ToDoリスト
│   │   ├── decisions-list.tsx  # 決定事項リスト
│   │   └── open-issues-list.tsx # 未解決課題リスト
│   └── animations/       # Framer Motion
├── hooks/                # カスタムフック
├── lib/                  # ユーティリティ
├── stores/               # Zustand ストア
├── types/                # TypeScript型定義
└── utils/                # ヘルパー関数
```

### 4.2 状態管理設計（Zustand）

```typescript
// セッション管理ストア
interface SessionStore {
  currentSession: RecordingSession | null;
  sessions: RecordingSession[];
  isRecording: boolean;
  audioData: AudioData | null;
  
  // アクション
  createSession: (title: string, language: Language) => Promise<void>; // Added language
  startRecording: () => void;
  stopRecording: () => void;
  updateUserNotes: (notes: string) => void;
  processSession: (sessionId: string, transcript: string, userNotes: string, language: Language) => Promise<void>; // Added sessionId, transcript, userNotes, language
}

// UI状態ストア
interface UIStore {
  currentLocale: string;
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'record' | 'sessions';
  
  // アクション
  setLocale: (locale: string) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

// ユーザーストア
interface UserStore {
  user: User | null;
  subscription: SubscriptionInfo | null;
  usageStats: UsageStats;
  
  // アクション
  updateProfile: (data: Partial<User>) => Promise<void>;
  upgradeSubscription: (plan: string) => Promise<void>;
}
```

### 4.3 アニメーション設計（Framer Motion）

```typescript
// オーディオ・オーロラエフェクト
const AudioAuroraVariants = {
  idle: { 
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 2, repeat: Infinity }
  },
  active: {
    scale: [1, 1.2, 0.8, 1.1, 1],
    opacity: [0.4, 0.8, 0.6, 0.9, 0.4],
    transition: { duration: 0.8, repeat: Infinity }
  }
};

// マジック・タイピングエフェクト
const TypewriterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.5
    }
  }
};

// 思考整理中アニメーション
const ThinkingVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};
```

## 5. 国際化設計（i18n）

### 5.1 翻訳ファイル構造
```
locales/
├── ja/
│   ├── common.json        # 共通用語
│   ├── dashboard.json     # ダッシュボード
│   ├── recording.json     # 録音機能
│   └── subscription.json  # 課金関連
├── en/
├── zh/
├── ko/
├── es/
├── fr/
├── de/
├── pt/
├── ar/                    # RTL対応
└── hi/
```

### 5.2 RTL対応設計
```css
/* アラビア語用RTLスタイル */
.rtl .recording-controls {
  flex-direction: row-reverse;
}

.rtl .sidebar {
  right: 0;
  left: auto;
  border-left: none;
  border-right: 1px solid theme('colors.gray.200');
}

.rtl .text-area {
  text-align: right;
  direction: rtl;
}
```

## 6. パフォーマンス最適化

### 6.1 画像・メディア最適化
- WebP/AVIF形式サポート
- 遅延読み込み（Intersection Observer）
- 音声ファイル圧縮（Opus コーデック）

### 6.2 コード分割
- ルートレベル分割（Next.js automatic

## Development Instructions
N/A

## Technical Stack
- Next.js 15 + React 19 + TypeScript (strict mode)
- TailwindCSS 4
- Vitest for unit tests
- Playwright for E2E tests

## Code Standards
- TypeScript strict mode, no `any`
- Minimal comments — code should be self-documenting
- Use path alias `@/` for imports from `src/`
- All components use functional style with proper typing

## Internationalization (i18n)
- Supported languages: ja (日本語), en (English), zh (中文), ko (한국어), es (Español), fr (Français), de (Deutsch), pt (Português), ar (العربية), hi (हिन्दी)
- Use the i18n module at `@/i18n` for all user-facing strings
- Use `t("key")` function for translations — never hardcode UI strings
- Auto-detect device language via expo-localization
- Default language: ja (Japanese)
- RTL support required for Arabic (ar)
- Use isRTL flag from i18n module for layout adjustments

