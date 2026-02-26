```diff
--- a/src/app/api/sessions/create/route.ts
+++ b/src/app/api/sessions/create/route.ts
@@ -3,7 +3,7 @@
 import { PrismaClient } from "@prisma/client";
 import { CreateSessionRequest } from "@/types";
 import { getServerSession } from "next-auth";
-import { authOptions } from "../../api/auth/[...nextauth]/route"; // Correct path to authOptions
+import { authOptions } from "../../api/auth/[...nextauth]/route"; // Correct path to authOptions, as per design
 
 const prisma = new PrismaClient();
 
```
