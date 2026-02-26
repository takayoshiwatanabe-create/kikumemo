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
    const aiOutputs = await prisma.ai_outputs.findMany({
      where: { session_id: sessionId },
      select: {
        type: true,
        content: true,
        confidence_score: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    if (!aiOutputs || aiOutputs.length === 0) {
      return NextResponse.json({ message: "AI outputs not found for this session" }, { status: 404 });
    }

    return NextResponse.json(aiOutputs, { status: 200 });
  } catch (error) {
    console.error("Error fetching AI outputs:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
