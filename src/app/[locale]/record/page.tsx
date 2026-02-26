import RecordScreen from "./index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Record Meeting - KikuMemo",
  description: "Start a new meeting recording and get AI summaries.",
};

export default function RecordPage() {
  return <RecordScreen />;
}


