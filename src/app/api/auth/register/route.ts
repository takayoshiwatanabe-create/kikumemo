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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        password_hash: hashedPassword,
        subscription_plan: "free",
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        subscription_plan: true,
        created_at: true,
      },
    });

    // Create user preferences with default language
    await prisma.user_preferences.create({
      data: {
        user_id: newUser.id,
        language: language || 'en',
      },
    });

    return NextResponse.json({ message: "User registered successfully", user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
