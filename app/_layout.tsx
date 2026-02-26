import React from "react";
import { redirect } from "next/navigation"; // Changed from "expo-router" to "next/navigation"
import { getDeviceLanguage } from "@/i18n"; // Import the detected language

export default function RootLayout() {
  // This file acts as the root redirector based on detected language.
  // It will redirect to the dashboard of the appropriate locale.
  const lang = getDeviceLanguage();
  redirect(`/${lang}/dashboard`);
}

