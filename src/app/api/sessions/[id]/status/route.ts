import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SessionStatusResponse } from "@/types";
import { Session } from "next-auth"; // Import Session type

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const sessionId = params.id;

  try {
    const recordingSession = await prisma.recording_sessions.findUnique({
      where: { id: sessionId, user_id: session.user.id },
      select: {
        id: true,
        status: true,
        transcript: true,
        ai_summary: true,
      },
    });

    if (!recordingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    const response: SessionStatusResponse = {
      id: recordingSession.id,
      status: recordingSession.status,
      transcript: recordingSession.transcript || undefined,
      aiSummary: recordingSession.ai_summary || undefined,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching session status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
