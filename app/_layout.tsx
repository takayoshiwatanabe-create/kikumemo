import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Redirect } from "expo-router";
import { lang } from "@/i18n"; // Import the detected language

export default function RootLayout() {
  // Redirect to the detected locale's root
  return <Redirect href={`/${lang}/dashboard`} />;
}

