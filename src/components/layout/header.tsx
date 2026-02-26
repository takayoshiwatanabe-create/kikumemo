```diff
--- a/src/components/layout/header.tsx
+++ b/src/components/layout/header.tsx
@@ -10,7 +10,7 @@
   };
 
   return (
-    <>
+    <> {/* Fragment is used to return multiple elements, header and sidebar */} 
       <header
         className={cn(
           "sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 dark:bg-gray-800 dark:border-gray-700 shadow-sm",
```
