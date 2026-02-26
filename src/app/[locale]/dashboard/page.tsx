import DashboardScreen from "./index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - KikuMemo",
  description: "Your meeting summaries at a glance.",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}


