import SessionDetailScreen from "../[id]";
import { Metadata } from "next";

// Dynamic metadata for session detail page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real app, you'd fetch the session title from a database based on params.id
  const sessionTitle = `Session ${params.id}`; // Placeholder
  return {
    title: `${sessionTitle} - KikuMemo`,
    description: `Details and AI summary for session ${params.id}.`,
  };
}

export default function SessionDetailPage() {
  return <SessionDetailScreen />;
}


