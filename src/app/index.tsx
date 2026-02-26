import { redirect } from "next/navigation";
import { getDeviceLanguage } from "@/i18n";

export default function AppRootRedirect() {
  // This file acts as the root redirector based on detected language.
  // It will redirect to the dashboard of the appropriate locale.
  const lang = getDeviceLanguage();
  redirect(`/${lang}/dashboard`);
}
