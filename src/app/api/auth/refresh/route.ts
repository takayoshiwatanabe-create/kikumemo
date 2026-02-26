import { NextResponse } from "next/server";
import { encode, decode } from "next-auth/jwt";
import { authOptions } from "../[...nextauth]/route";
import { RefreshRequest } from "@/types";
import { PrismaClient } from "@prisma/client"; // Import PrismaClient to fetch user data

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { refreshToken }: RefreshRequest = await req.json();

    if (!refreshToken) {
      return NextResponse.json({ message: "Missing refresh token" }, { status: 400 });
    }

    // Decode the refresh token to get user information
    const decodedToken = await decode({
      token: refreshToken,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // The decoded token might be null or not have the expected properties.
    // Ensure `decodedToken` is not null and has the required properties before accessing them.
    if (!decodedToken || typeof decodedToken.id !== 'string') { // Only ID is strictly needed to fetch user
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    // In a real application, you would verify the refresh token against a database
    // to ensure it's still valid and hasn't been revoked.
    // For this example, we'll assume the decoded token is sufficient.

    // Fetch the latest user data from the database to ensure the new access token is up-to-date
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar_url: true,
        subscription_plan: true, // Include subscription_plan
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found for refresh token" }, { status: 404 });
    }

    // Generate a new access token (JWT)
    const newAccessToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.avatar_url,
        subscription_plan: user.subscription_plan, // Add subscription_plan to the new token
        // Potentially add other user data from the decoded refresh token
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: authOptions.session?.maxAge, // Use the same maxAge as the session
    });

    // Optionally, generate a new refresh token and invalidate the old one
    // For simplicity, we're just returning a new access token here.
    // A more robust solution would involve refresh token rotation.

    return NextResponse.json({ message: "Token refreshed successfully", accessToken: newAccessToken }, { status: 200 });

  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ message: "Internal server error or invalid token" }, { status: 500 });
  }
}
