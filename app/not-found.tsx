import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFoundPage");
  const meta = await getTranslations("meta");

  return {
    title: `${t("title")} · ${meta("title")}`,
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const t = await getTranslations("notFoundPage");
  const tu = await getTranslations("user");

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">{t("message")}</p>
      <Link href="/" className={cn(buttonVariants(), "rounded-full")}>
        {tu("backHome")}
      </Link>
    </div>
  );
}