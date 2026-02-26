import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route"; // Import authOptions
import { LoginRequest } from "@/types";
import { encode } from "next-auth/jwt"; // Import encode directly for server-side JWT generation
import { RequestInternal } from "next-auth/core"; // Correct import for RequestInternal
import { NextAuthURL } from "next-auth/web"; // Import NextAuthURL for the `url` property on `RequestInternal`
import { PrismaClient } from "@prisma/client"; // Import PrismaClient to fetch user data for JWT

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Missing email or password" }, { status: 400 });
    }

    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === "credentials"
    );

    if (!credentialsProvider || typeof credentialsProvider === 'string' || !('authorize' in credentialsProvider)) {
      return NextResponse.json({ message: "Credentials provider not found or misconfigured" }, { status: 500 });
    }

    // For NextAuth v5, the `authorize` function's second argument is `RequestInternal`.
    // We need to construct a mock `RequestInternal` object that satisfies the `authorize` function.
    // The `RequestInternal` type expects `url`, `headers`, `body`, `method`, `cookies`, `query`.
    // For `authorize`, `url` is typically derived from the request, and `headers` might be used.
    // The `body` needs to be a string for `RequestInternal`.
    const requestBody = JSON.stringify({ email, password }); // Re-serialize body for mockRequestInternal

    const mockRequestInternal: RequestInternal = {
      headers: req.headers,
      url: new NextAuthURL(req.url), // Use NextAuthURL for the URL object
      body: requestBody, // Pass body as text
      method: req.method,
      cookies: [], // Not strictly needed for credentials authorize
      query: {}, // Not strictly needed for credentials authorize
    };

    const user = await (credentialsProvider as any).authorize(
      { email, password },
      mockRequestInternal
    );

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Fetch the full user object from the database to ensure all required fields for JWT are present
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        subscription_plan: true, // Include subscription_plan
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found after authorization" }, { status: 404 });
    }

    // To generate a JWT manually using NextAuth's secret:
    // The `encode` function expects a `token` object that matches the JWT structure.
    const token = await encode({
      token: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.avatar_url,
        subscription_plan: dbUser.subscription_plan, // Add subscription_plan to the token
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: authOptions.session?.maxAge,
    });

    return NextResponse.json({ message: "Login successful", accessToken: token }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
