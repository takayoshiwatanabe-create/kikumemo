--- a/src/app/[locale]/_layout.tsx
+++ b/src/app/[locale]/_layout.tsx
@@ -14,12 +14,7 @@
     document.documentElement.dir = isRTL ? "rtl" : "ltr";
   }, [lang, isRTL]);
 
-  return (
-    // SessionProvider is intentionally placed here to wrap locale-specific routes,
-    // allowing session access within these routes. The root SessionProvider in src/app/layout.tsx
-    // ensures it's available for the entire app, but this one is fine for specific route groups.
-    // NOTE: Placing SessionProvider here is redundant and potentially problematic if it's already
-    // in the root layout. NextAuth recommends wrapping the entire app once.
-    // The root `src/app/layout.tsx` already includes `SessionProvider`.
-    // Removing this redundant SessionProvider.
+  return (
     <div className={cn("flex min-h-screen flex-col lg:flex-row", isRTL ? "rtl" : "ltr")}>
       {/* Sidebar for large screens, always static here */}
       <Sidebar isOpen={false} onClose={() => {}} isStatic={true} />
