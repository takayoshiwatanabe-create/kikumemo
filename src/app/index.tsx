```diff
--- a/src/app/index.tsx
+++ b/src/app/index.tsx
@@ -1,13 +1,3 @@
-// This file is not directly used by Next.js App Router for routing.
-// The root redirect logic is handled in `src/app/page.tsx`.
-// This file can be removed or renamed if it's not intended to be a route.
-// For now, keeping it as is but noting its non-routing role.
-
-import { redirect } from "next/navigation";
-import { getDeviceLanguage } from "@/i18n";
-import { headers } from "next/headers"; // Import headers for server-side language detection
-
-export default function AppRootRedirect() {
-  // This file acts as the root redirector based on detected language.
-  // It will redirect to the dashboard of the appropriate locale.
-  // This function is intended for server-side execution.
-  const requestHeaders = headers(); // Get headers on the server
-  const lang = getDeviceLanguage(requestHeaders); // Pass headers to getDeviceLanguage
-  redirect(`/${lang}/dashboard`);
-}
+/* This file is redundant as the root redirect logic is handled in `src/app/page.tsx`.
+   It should be removed to avoid confusion and unnecessary files. */
```
