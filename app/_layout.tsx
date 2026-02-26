import { Redirect } from "next/navigation"; // Changed from "expo-router" to "next/navigation"
import { lang } from "@/i18n"; // Import the detected language

export default function RootLayout() {
  // Redirect to the detected locale's root
  return <Redirect href={`/${lang}/dashboard`} />;
}

