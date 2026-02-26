import SettingsScreen from "./index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - KikuMemo",
  description: "Manage your user preferences and application settings.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}


