"use client"; // This component uses client-side hooks like getDeviceLanguage and redirect

import { redirect } from "next/navigation"; // Changed from "expo-router" to "next/navigation"
import { getDeviceLanguage } from "@/i18n";

export default function AppRootRedirect() {
  // This file acts as the root redirector based on detected language.
  // It will redirect to the dashboard of the appropriate locale.
  const lang = getDeviceLanguage();
  redirect(`/${lang}/dashboard`); // Use redirect as a function call
}
