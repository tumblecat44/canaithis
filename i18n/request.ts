import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, locales, type Locale } from "@/i18n/routing";

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("NEXT_LOCALE")?.value;
  const locale: Locale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});