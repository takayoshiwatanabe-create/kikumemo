import { NextResponse } from "next/server";
import { encode, decode } from "next-auth/jwt";
import { authOptions } from "../[...nextauth]/route";
import { RefreshRequest } from "@/types";

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

    if (!decodedToken || !decodedToken.id || !decodedToken.email || !decodedToken.name) {
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    // In a real application, you would verify the refresh token against a database
    // to ensure it's still valid and hasn't been revoked.
    // For this example, we'll assume the decoded token is sufficient.

    // Generate a new access token (JWT)
    const newAccessToken = await encode({
      token: {
        id: decodedToken.id,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
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

