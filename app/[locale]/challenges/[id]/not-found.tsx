import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "challenge" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("notFoundTitle")} · ${meta("title")}`,
    description: t("notFoundDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function ChallengeNotFound() {
  const t = await getTranslations("challenge");
  const tu = await getTranslations("user");

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">{t("notFound")}</p>
      <Link href="/" className={cn(buttonVariants(), "rounded-full")}>
        {tu("backHome")}
      </Link>
    </div>
  );
}