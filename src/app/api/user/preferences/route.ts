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
    const preferences = await prisma.user_preferences.findUnique({
      where: { user_id: session.user.id },
    });

    if (!preferences) {
      // Create default preferences if none exist
      const defaultPreferences = await prisma.user_preferences.create({
        data: {
          user_id: session.user.id,
          language: "en", // Default to English if not specified during registration
          timezone: "Asia/Tokyo",
          audio_quality: "standard",
          auto_save: true,
          export_format: "markdown",
        },
      });
      return NextResponse.json(defaultPreferences, { status: 200 });
    }

    return NextResponse.json(preferences, { status: 200 });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // The request body should match the database schema for update operations
    const updatedFields: Partial<{
      language: string;
      timezone: string;
      audio_quality: "standard" | "high";
      auto_save: boolean;
      export_format: "markdown" | "docx" | "pdf";
    }> = await request.json();

    const updatedPreferences = await prisma.user_preferences.update({
      where: { user_id: session.user.id },
      data: {
        language: updatedFields.language,
        timezone: updatedFields.timezone,
        audio_quality: updatedFields.audio_quality,
        auto_save: updatedFields.auto_save,
        export_format: updatedFields.export_format,
      },
    });

    return NextResponse.json(updatedPreferences, { status: 200 });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


