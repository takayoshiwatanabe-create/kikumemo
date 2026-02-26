```diff
--- a/src/app/api/auth/login/route.ts
+++ b/src/app/api/auth/login/route.ts
@@ -53,7 +53,7 @@
     // Returning it here might be for a specific custom client-side auth implementation.
     return NextResponse.json(
       { message: "Login successful", accessToken: token },
-      { status: 200 }
+      { status: 200 } // Should also set a cookie for the JWT for NextAuth to pick it up
     );
   } catch (error) {
     console.error("Login error:", error);
```
