import SessionsScreen from "./index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Sessions - KikuMemo",
  description: "View all your recorded meeting sessions and their AI summaries.",
};

export default function SessionsPage() {
  return <SessionsScreen />;
}


