```diff
--- a/src/app/[locale]/_layout.tsx
+++ b/src/app/[locale]/_layout.tsx
@@ -21,8 +21,7 @@
     <html lang={currentLocale} dir={dir(currentLocale)}>
       <body>
         <I18nProvider initialLocale={currentLocale}>
-          <div className="flex min-h-screen flex-col lg:flex-row">
-            {" "}
+          <div className="flex min-h-screen flex-col lg:flex-row">{" "}
             {/* Sidebar for large screens, always static here */}
             <Sidebar isOpen={false} onClose={() => {}} isStatic={true} />
             <div className="flex flex-1 flex-col">
```
