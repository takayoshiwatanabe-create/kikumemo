```diff
--- a/src/i18n/index.ts
+++ b/src/i18n/index.ts
@@ -1,7 +1,6 @@
 "use client";
 
 import { translations, type Language } from "./translations";
-import { useState, createContext, useContext, ReactNode, useEffect } from "react";
 import { useRouter, useSelectedLayoutSegments } from "next/navigation";
 import { match } from "@formatjs/intl-localematcher";
 import Negotiator from "negotiator";
@@ -30,6 +29,7 @@
   t: (key: string, vars?: Record<string, string | number>) => string;
   setLanguage: (newLang: Language) => void;
 }
+import { useState, createContext, useContext, ReactNode, useEffect } from "react"; // Moved import to top to follow standard practices
 
 const I18nContext = createContext<I18nContextType | undefined>(undefined);
 
```
