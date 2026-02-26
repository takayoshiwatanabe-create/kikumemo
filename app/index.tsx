import { Redirect } from "expo-router";
import { lang } from "@/i18n";

export default function AppRootRedirect() {
  // This file acts as the root redirector based on detected language.
  // It will redirect to the dashboard of the appropriate locale.
  return <Redirect href={`/${lang}/dashboard`} />;
}
