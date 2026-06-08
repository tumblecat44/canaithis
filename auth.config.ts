import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";

import { locales } from "@/i18n/routing";
import { isValidUserId } from "@/lib/user-id";

function stripLocalePrefix(pathname: string) {
  for (const locale of locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1);
    }
  }
  return pathname;
}

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
      const pathname = stripLocalePrefix(request.nextUrl.pathname);
      const challengeEditMatch = pathname.match(
        /^\/challenges\/([^/]+)\/edit\/?$/,
      );
      if (challengeEditMatch && !isValidUserId(challengeEditMatch[1]!)) {
        return new NextResponse(null, { status: 404 });
      }
      const solutionEditMatch = pathname.match(
        /^\/challenges\/([^/]+)\/solutions\/([^/]+)\/edit\/?$/,
      );
      if (
        solutionEditMatch &&
        (!isValidUserId(solutionEditMatch[1]!) ||
          !isValidUserId(solutionEditMatch[2]!))
      ) {
        return new NextResponse(null, { status: 404 });
      }
      const isSolutionWrite =
        /^\/challenges\/[^/]+\/solutions\/new\/?$/.test(pathname) ||
        /^\/challenges\/[^/]+\/solutions\/[^/]+\/edit\/?$/.test(pathname);
      const isProtected =
        pathname === "/challenges/new" ||
        pathname.startsWith("/challenges/new/") ||
        pathname === "/profile" ||
        pathname.startsWith("/profile/") ||
        isSolutionWrite;

      if (isProtected && !auth?.user) {
        const signInUrl = new URL("/login", request.nextUrl);
        signInUrl.searchParams.set(
          "callbackUrl",
          `${pathname}${request.nextUrl.search}`,
        );
        return NextResponse.redirect(signInUrl);
      }
      return true;
    },
  },
} satisfies NextAuthConfig;