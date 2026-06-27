/**
 * Auth.js v5 (next-auth@beta) configuration
 * Providers: Google + LINE
 * Adapter: PrismaAdapter (Auth.js Prisma adapter)
 * Sessions: JWT (stateless — no Session table round-trip needed)
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Line({
      clientId: process.env.AUTH_LINE_ID!,
      clientSecret: process.env.AUTH_LINE_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Attach role to JWT so session.user.role is available client-side
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "student";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? "student";
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
});

// Augment next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role?: string;
  }
}
