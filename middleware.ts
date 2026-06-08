import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";
import { isValidUserId } from "@/lib/user-id";

const handleI18nRouting = createIntlMiddleware(routing);

const { auth } = NextAuth(authConfig);

const USER_PATH_RE = /^\/(ko|en)\/users\/([^/]+)\/?$/;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const userMatch = pathname.match(USER_PATH_RE);
  if (userMatch && !isValidUserId(userMatch[2]!)) {
    return new NextResponse(null, { status: 404 });
  }
  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon|robots.txt|sitemap.xml|feed.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};