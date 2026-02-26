import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { LoginRequest } from "@/types";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password }: LoginRequest = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json(
      { message: "Login successful", user: { id: user.id, email: user.email, name: user.name, subscription_plan: user.subscription_plan } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


