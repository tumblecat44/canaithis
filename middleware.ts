import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon|robots.txt|sitemap.xml|feed.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};