import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json({ message: "Refresh token endpoint is not actively used with NextAuth's default JWT strategy. Session refresh is handled internally." }, { status: 200 });
}


