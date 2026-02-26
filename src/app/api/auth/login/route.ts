import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route"; // Import authOptions
import { LoginRequest } from "@/types";
import { encode } from "next-auth/jwt"; // Import encode directly for server-side JWT generation
import { PrismaClient } from "@prisma/client"; // Import PrismaClient to fetch user data for JWT
import bcrypt from "bcryptjs"; // Import bcrypt for password comparison

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 }
      );
    }

    // Directly handle authentication logic here without relying on `authorize` from `credentialsProvider`
    // as it's designed for NextAuth's internal flow, not direct API route usage.
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // User is authenticated, now generate a JWT
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.avatar_url,
        subscription_plan: user.subscription_plan,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: authOptions.session?.maxAge,
    });

    // For NextAuth v5, the `accessToken` is typically set as a cookie by the `NextAuth` handler.
    // If you need to return it in the response body for a custom client-side flow,
    // ensure your client handles it securely (e.g., storing in httpOnly cookie).
    // However, the standard NextAuth flow manages session cookies automatically.
    // Returning it here might be for a specific custom client-side auth implementation.
    return NextResponse.json(
      { message: "Login successful", accessToken: token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
