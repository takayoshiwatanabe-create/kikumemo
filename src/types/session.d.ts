```diff
--- a/src/types/session.d.ts
+++ b/src/types/session.d.ts
@@ -1,6 +1,6 @@
 // This file is specifically for session-related types.
 // It complements the main `types/index.ts` by providing more granular definitions
 // if needed, or can be merged into `types/index.ts` if preferred for simplicity.
-
-import { Language } from '@/i18n/translations'; // Assuming Language type is defined here
+ 
+import { Language } from '@/i18n/translations'; // Assuming Language type is defined here, as per design
 
 // Recording Session
 export interface RecordingSession {
```
