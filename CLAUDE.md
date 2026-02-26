```diff
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -219,6 +219,7 @@
   currentSession: RecordingSession | null;
   sessions: RecordingSession[];
   isRecording: boolean;
+  isLoading: boolean;
   audioData: AudioData | null;
   
   // アクション
```
