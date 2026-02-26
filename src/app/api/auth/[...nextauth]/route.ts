import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt"; // Import JWT type
import { Session } from "next-auth"; // Import Session type

const prisma = new PrismaClient();

// Extend the Session and JWT types to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      subscription_plan: string; // Add subscription_plan
    } & Session["user"];
  }

  interface User {
    id: string; // Ensure id is present
    email: string; // Ensure email is present
    name: string; // Ensure name is present
    image?: string | null; // Ensure image is present
    subscription_plan: string; // Add subscription_plan to User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    picture?: string | null;
    subscription_plan: string; // Add subscription_plan
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        // `password_hash` is now added to the `users` table in CLAUDE.md.
        // This check is now consistent with the design spec.
        if (!user || !user.password_hash || !(await bcrypt.compare(credentials.password, user.password_hash))) {
          return null;
        }

        // Return user object with necessary fields for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url, // Map avatar_url to image
          subscription_plan: user.subscription_plan,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Ensure token properties are correctly typed
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image; // Map image to picture
        token.subscription_plan = (user as any).subscription_plan; // Cast to any to access custom property
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Ensure session.user properties are correctly typed
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture; // Map picture to image
        session.user.subscription_plan = token.subscription_plan;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Redirect to custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
