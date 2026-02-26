import { redirect } from "next/navigation";
import { getDeviceLanguage } from "@/i18n";
import { headers } from "next/headers";

export default function AppRootRedirect() {
  const requestHeaders = headers();
  const lang = getDeviceLanguage(requestHeaders);
  redirect(`/${lang}/dashboard`);
}
