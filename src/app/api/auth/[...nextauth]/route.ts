import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters"; // Import Adapter type
import type { JWT } from "next-auth/jwt"; // Import JWT type

const prisma = new PrismaClient();

// Extend the NextAuth session and JWT types to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      // Add other properties from your user model here
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    // Add other properties from your user model here
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    picture?: string;
    accessToken?: string;
    refreshToken?: string;
    // Add other properties from your user model here
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter, // Cast PrismaAdapter to Adapter type
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password_hash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValidPassword) {
          return null;
        }

        // Return user object without sensitive data
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
          // Add any other non-sensitive user data needed for the session
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    // The `jwt` option here is for NextAuth v4. In v5, it's typically configured differently or inferred.
    // For v5, the secret is usually passed directly to NextAuth or derived from NEXTAUTH_SECRET env var.
    // This `jwt` object might be deprecated or changed in v5.
    // Keeping it for now as it was in the original code, but be aware for v5.
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Add custom properties from the user object if needed
      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Ensure session.user properties are defined
        if (!session.user) {
          session.user = {} as typeof session.user; // Initialize if null
        }
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        // Add custom properties to session.user
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Custom sign-in page
    error: "/auth/error", // Custom error page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
