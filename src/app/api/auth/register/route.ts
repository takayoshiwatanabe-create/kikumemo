import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { RegisterRequest } from "@/types";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, name, password, language }: RegisterRequest = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ message: "Email, name, and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    // `password_hash` is now added to the `users` table in CLAUDE.md.
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        password_hash: hashedPassword,
        subscription_plan: "free", // Default to free plan
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Optionally create user preferences
    await prisma.user_preferences.create({
      data: {
        user_id: newUser.id,
        language: language || "en", // Default to 'en' if not provided
        timezone: "Asia/Tokyo", // Default timezone
        audio_quality: "standard",
        auto_save: true,
        export_format: "markdown",
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", user: { id: newUser.id, email: newUser.email, name: newUser.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
