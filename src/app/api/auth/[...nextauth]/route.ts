import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";
import { User as NextAuthUser } from "next-auth"; // Import NextAuth's User type
import { JWT } from "next-auth/jwt"; // Import JWT type

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
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

        // Return user object without sensitive data, cast to NextAuthUser
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url, // Map avatar_url to image for NextAuth User type
          subscription_plan: user.subscription_plan,
        } as NextAuthUser; // Explicitly cast to NextAuthUser
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // The 'user' object here is the one returned by the 'authorize' function.
        // It already has the extended properties due to the type declaration in auth.d.ts.
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image; // Map user.image to token.picture
        token.subscription_plan = (user as any).subscription_plan; // Access subscription_plan
      }
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token as JWT; // Explicitly cast to JWT
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
        session.user.image = token.picture as string | null | undefined; // Ensure type matches
        session.user.subscription_plan = token.subscription_plan as
          | "free"
          | "monthly"
          | "yearly"
          | undefined; // Add subscription_plan to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Custom sign-in page
    error: "/auth/error", // Custom error page
  },
  secret: process.env.NEXTAUTH_SECRET, // The secret is configured here for NextAuth v5
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
