--- a/src/app/api/auth/register/route.ts
+++ b/src/app/api/auth/register/route.ts
@@ -26,8 +26,7 @@
 
     const hashedPassword = await bcrypt.hash(password, 10);
 
-    // The design spec for `users` table does not include `password_hash`.
-    // This is a deviation. The `users` table in CLAUDE.md needs to be updated.
+    // `password_hash` is now added to the `users` table in CLAUDE.md.
     const newUser = await prisma.users.create({
       data: {
         id: crypto.randomUUID(),
