```diff
--- a/src/app/api/auth/refresh/route.ts
+++ b/src/app/api/auth/refresh/route.ts
@@ -74,7 +74,7 @@
     // This API route assumes a custom refresh token flow where the client explicitly sends a refresh token.
     return NextResponse.json(
       { message: "Token refreshed successfully", accessToken: newAccessToken },
-      { status: 200 }
+      { status: 200 } // Should also set a cookie for the JWT for NextAuth to pick it up
     );
   } catch (error) {
     console.error("Refresh token error:", error);
```
