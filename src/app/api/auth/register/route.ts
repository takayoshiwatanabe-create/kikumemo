```diff
--- a/src/app/api/auth/register/route.ts
+++ b/src/app/api/auth/register/route.ts
@@ -62,7 +62,7 @@
         name: true,
         avatar_url: true,
         subscription_plan: true,
-        created_at: true,
+        createdAt: true, // Changed to createdAt to match Prisma's default field name
       },
     });
 
```
