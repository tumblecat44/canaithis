"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { locales, type Locale } from "@/i18n/routing";

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    return;
  }

  const store = await cookies();
  store.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const headerStore = await headers();
  const referer = headerStore.get("referer");
  const fallback = "/";
  let target = fallback;

  if (referer) {
    try {
      const { pathname, search } = new URL(referer);
      target = `${pathname}${search}`;
    } catch {
      target = fallback;
    }
  }

  redirect(target);
}