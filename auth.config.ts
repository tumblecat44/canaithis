import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isSolutionWrite =
        /^\/challenges\/[^/]+\/solutions\/new\/?$/.test(pathname) ||
        /^\/challenges\/[^/]+\/solutions\/[^/]+\/edit\/?$/.test(pathname);
      const isProtected =
        pathname === "/challenges/new" ||
        pathname.startsWith("/challenges/new/") ||
        pathname === "/profile" ||
        pathname.startsWith("/profile/") ||
        isSolutionWrite;

      if (isProtected) {
        return !!auth?.user;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;