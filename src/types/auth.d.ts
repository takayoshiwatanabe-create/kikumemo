// This file extends NextAuth's types to include custom properties
// as per the NextAuth v5 documentation and project requirements.

import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

// Extend the NextAuth session and JWT types to include custom properties
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null; // avatar_url maps to image in NextAuth
      // Add other properties from your user model here if needed in the session
      // e.g., subscription_plan: 'free' | 'monthly' | 'yearly';
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the Credentials provider's `authorize` callback.
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
    avatar_url?: string | null; // Matches your database schema
    // Add other properties from your user model here
    // e.g., subscription_plan: 'free' | 'monthly' | 'yearly';
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback and `getToken`, when using JWT sessions
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    name: string;
    picture?: string | null; // Corresponds to avatar_url
    accessToken?: string;
    refreshToken?: string;
    // Add other properties from your user model here if needed in the JWT
    // e.g., subscription_plan: 'free' | 'monthly' | 'yearly';
  }
}

// Note: The `types/index.ts` file already defines `LoginRequest`, `RegisterRequest`, `RefreshRequest`.
// This `auth.d.ts` file is specifically for extending NextAuth's internal types.
// No need to duplicate `LoginRequest` etc. here.

