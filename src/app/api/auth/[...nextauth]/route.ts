--- a/src/app/api/auth/[...nextauth]/route.ts
+++ b/src/app/api/auth/[...nextauth]/route.ts
@@ -21,9 +21,7 @@
           where: { email: credentials.email },
         });
 
-        // Ensure `password_hash` is present in the user object
-        // The design spec for `users` table does not include `password_hash`.
-        // It should be added to the `users` table definition in CLAUDE.md.
-        // Assuming `password_hash` exists for now based on its usage here.
+        // `password_hash` is now added to the `users` table in CLAUDE.md.
+        // This check is now consistent with the design spec.
         if (!user || !user.password_hash || !(await bcrypt.compare(credentials.password, user.password_hash))) {
           return null;
         }
