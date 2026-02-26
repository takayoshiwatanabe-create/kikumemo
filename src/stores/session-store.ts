```diff
--- a/src/stores/session-store.ts
+++ b/src/stores/session-store.ts
@@ -10,7 +10,7 @@
   sessions: RecordingSession[];
   isRecording: boolean;
   audioData: AudioData | null; // For real-time audio visualization/processing
-  isLoading: boolean;
+  isLoading: boolean; // Added isLoading as per design
   error: string | null;
 
   // Actions
```
