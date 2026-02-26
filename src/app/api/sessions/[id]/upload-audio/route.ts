```diff
--- a/src/app/api/sessions/[id]/upload-audio/route.ts
+++ b/src/app/api/sessions/[id]/upload-audio/route.ts
@@ -57,7 +57,7 @@
       data: {
         audio_file_path: fileName,
         user_notes: userNotes,
-        status: "processing", // Change status to processing after upload
+        status: "processing", // Change status to processing after upload, as per design
       },
     });
 
```
