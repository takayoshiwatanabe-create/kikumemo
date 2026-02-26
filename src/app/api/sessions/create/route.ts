import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CreateSessionRequest } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route"; // Correct path to authOptions

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, language }: CreateSessionRequest = await req.json();

    if (!title) {
      return NextResponse.json(
        { message: "Missing required field: title" },
        { status: 400 }
      );
    }

    const newSession = await prisma.recordingSession.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        title,
        status: "recording", // Initial status
        duration_seconds: 0,
        language_code: language || "ja", // Default to 'ja' if not provided
      },
    });

    return NextResponse.json(
      { message: "Session created successfully", session: newSession },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


