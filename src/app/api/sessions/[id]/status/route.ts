import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route"; // Correct path to authOptions
import { SessionStatusResponse } from "@/types";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.id;

    const existingSession = await prisma.recordingSession.findUnique({
      where: { id: sessionId, userId: session.user.id },
      select: {
        id: true,
        status: true,
        transcript: true,
        ai_summary: true,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    // For now, progress is a placeholder. In a real system, this would come from a background processing service.
    let progress: number | undefined = undefined;
    if (existingSession.status === "processing") {
      // Simulate progress for demonstration
      progress = 50; // Example: 50% for processing
    } else if (existingSession.status === "completed") {
      progress = 100;
    } else if (existingSession.status === "recording") {
      progress = 10;
    }

    const response: SessionStatusResponse = {
      id: existingSession.id,
      status: existingSession.status,
      progress: progress,
      transcript: existingSession.transcript,
      aiSummary: existingSession.ai_summary,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching session status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


