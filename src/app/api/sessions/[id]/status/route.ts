```diff
--- a/src/app/api/sessions/[id]/status/route.ts
+++ b/src/app/api/sessions/[id]/status/route.ts
@@ -3,7 +3,7 @@
 import { PrismaClient } from "@prisma/client";
 import { getServerSession } from "next-auth";
 import { authOptions } from "../../../api/auth/[...nextauth]/route"; // Correct path to authOptions
-import { SessionStatusResponse } from "@/types";
+import { SessionStatusResponse } from "@/types/session"; // Correct import path as per design
 
 const prisma = new PrismaClient();
 
```
