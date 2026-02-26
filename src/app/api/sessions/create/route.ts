import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { CreateSessionRequest } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, language }: CreateSessionRequest = await request.json();

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const newSession = await prisma.recording_sessions.create({
      data: {
        id: crypto.randomUUID(),
        user_id: session.user.id,
        title,
        status: "recording",
        language_code: language || "en",
        duration_seconds: 0,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


