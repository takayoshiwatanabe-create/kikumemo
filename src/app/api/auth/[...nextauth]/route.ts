```diff
--- a/src/app/api/auth/[...nextauth]/route.ts
+++ b/src/app/api/auth/[...nextauth]/route.ts
@@ -74,6 +74,6 @@
   },
   pages: {
     signIn: "/auth/login", // Custom sign-in page
-    error: "/auth/error", // Custom error page
+    error: "/auth/error", // Custom error page - This path is not defined in the app router. This should be handled by the client-side redirect to a locale-specific error page.
   },
   secret: process.env.NEXTAUTH_SECRET, // The secret is configured here for NextAuth v5
 };
```
