import { NextResponse } from "next/server";
import { authOptions } from "../[...nextauth]/route"; // Import authOptions
import { LoginRequest } from "@/types";
import { encode } from "next-auth/jwt"; // Import encode directly for server-side JWT generation
import { NextAuthRequest } from "next-auth/lib/types"; // Import NextAuthRequest for authorize signature
import { NextAuthURL } from "next-auth/web"; // Import NextAuthURL for the `url` property on `RequestInternal`

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
    const mockRequestInternal: NextAuthRequest = {
      headers: req.headers,
      url: new NextAuthURL(req.url), // Use NextAuthURL for the URL object
      body: await req.text(), // Pass body as text, authorize might parse it
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

    // To generate a JWT manually using NextAuth's secret:
    // The `encode` function expects a `token` object that matches the JWT structure.
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.image,
        // Add other user data as per jwt callback
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

