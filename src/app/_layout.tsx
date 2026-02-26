```diff
--- a/src/app/_layout.tsx
+++ b/src/app/_layout.tsx
@@ -7,7 +7,7 @@
   // The `RootLayout` should provide a basic HTML structure that is then enhanced by `[locale]/_layout.tsx`.
   // The `lang` attribute is set to a default here, but will be overridden by the `[locale]/_layout.tsx`
   // which sets the correct language based on the URL segment.
-  return (
-    <html lang="en" suppressHydrationWarning> {/* Default to 'en' or a neutral language for the very root, overridden by [locale] */}
+  return ( 
+    <html lang="en" suppressHydrationWarning>
       <body>
         {children}
       </body>
```
