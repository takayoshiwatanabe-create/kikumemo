import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { RegisterRequest } from "@/types";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, name, password, language }: RegisterRequest = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(), // Generate a UUID for the user ID
        email,
        name,
        password_hash: hashedPassword,
        subscription_plan: "free", // Default to free plan
        userPreferences: {
          create: {
            language: language || "ja", // Default language from request or 'ja'
            timezone: "Asia/Tokyo", // Default timezone
            audioQuality: "standard",
            autoSave: true,
            exportFormat: "markdown",
          },
        },
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

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


