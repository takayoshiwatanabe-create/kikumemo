import { redirect } from "next/navigation";
import { getDeviceLanguage } from "@/i18n";
import { headers } from "next/headers"; // Import headers for server-side language detection

export default function AppRootRedirect() {
  // This file acts as the root redirector based on detected language.
  // It will redirect to the dashboard of the appropriate locale.
  // This function runs on the server.
  const requestHeaders = headers(); // Get headers on the server
  const lang = getDeviceLanguage(requestHeaders); // Pass headers to getDeviceLanguage
  redirect(`/${lang}/dashboard`);
}
