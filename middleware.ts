import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";
import { isValidUserId } from "@/lib/user-id";

const handleI18nRouting = createIntlMiddleware(routing);

const { auth } = NextAuth(authConfig);

const USER_PATH_RE = /^\/(ko|en)\/users\/([^/]+)\/?$/;
const CHALLENGE_PATH_RE = /^\/(ko|en)\/challenges\/([^/]+)\/?$/;
const CHALLENGE_EDIT_PATH_RE =
  /^\/(ko|en)\/challenges\/([^/]+)\/edit\/?$/;
const SOLUTION_NEW_PATH_RE =
  /^\/(ko|en)\/challenges\/([^/]+)\/solutions\/new\/?$/;
const SOLUTION_EDIT_PATH_RE =
  /^\/(ko|en)\/challenges\/([^/]+)\/solutions\/([^/]+)\/edit\/?$/;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const userMatch = pathname.match(USER_PATH_RE);
  if (userMatch && !isValidUserId(userMatch[2]!)) {
    return new NextResponse(null, { status: 404 });
  }
  const challengeMatch = pathname.match(CHALLENGE_PATH_RE);
  if (challengeMatch && !isValidUserId(challengeMatch[2]!)) {
    return new NextResponse(null, { status: 404 });
  }
  const challengeEditMatch = pathname.match(CHALLENGE_EDIT_PATH_RE);
  if (challengeEditMatch && !isValidUserId(challengeEditMatch[2]!)) {
    return new NextResponse(null, { status: 404 });
  }
  const solutionNewMatch = pathname.match(SOLUTION_NEW_PATH_RE);
  if (solutionNewMatch && !isValidUserId(solutionNewMatch[2]!)) {
    return new NextResponse(null, { status: 404 });
  }
  const solutionEditMatch = pathname.match(SOLUTION_EDIT_PATH_RE);
  if (
    solutionEditMatch &&
    (!isValidUserId(solutionEditMatch[2]!) ||
      !isValidUserId(solutionEditMatch[3]!))
  ) {
    return new NextResponse(null, { status: 404 });
  }
  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon|robots.txt|sitemap.xml|feed.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};