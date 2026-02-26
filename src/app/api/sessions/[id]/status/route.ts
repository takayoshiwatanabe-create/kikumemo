import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";

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
        title: true,
        user_notes: true,
        duration_seconds: true,
        language_code: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!recordingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    const response = {
      id: recordingSession.id,
      status: recordingSession.status,
      transcript: recordingSession.transcript || undefined,
      ai_summary: recordingSession.ai_summary || undefined,
      title: recordingSession.title,
      user_notes: recordingSession.user_notes || undefined,
      duration_seconds: recordingSession.duration_seconds,
      language_code: recordingSession.language_code,
      created_at: recordingSession.created_at,
      updated_at: recordingSession.updated_at,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching session status:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


