import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import { defaultLocale, locales } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never",
  localeDetection: false,
});

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  return handleI18nRouting(req);
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};