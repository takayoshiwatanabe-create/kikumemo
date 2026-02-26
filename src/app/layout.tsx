```diff
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -14,8 +14,7 @@
 // This is the root layout for the entire application.
 // It wraps all other layouts and pages.
 export default function RootLayout({ children }: { children: React.ReactNode }) {
-  return (
-    <html lang="ja" suppressHydrationWarning>
-      {" "}
-      {/* Default to 'ja' for the very root, overridden by [locale] */}
+  return ( 
+    <html lang="ja" suppressHydrationWarning> {/* Default to 'ja' for the very root, overridden by [locale] */}
       <body>{children}</body>
     </html>
   );
```
