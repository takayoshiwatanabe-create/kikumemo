import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userSessions = await prisma.recording_sessions.findMany({
      where: { user_id: session.user.id },
      orderBy: {
        created_at: 'desc',
      },
      select: {
        id: true,
        title: true,
        status: true,
        duration_seconds: true,
        language_code: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(userSessions, { status: 200 });
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
