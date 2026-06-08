import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

import { HomeFeed } from "@/components/home-feed";
import { Link } from "@/i18n/navigation";
import { Skeleton } from "@/components/ui/skeleton";

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    login?: string;
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q, category, page } = await searchParams;
  const t = await getTranslations({ locale, namespace: "meta" });
  const th = await getTranslations({ locale, namespace: "home" });
  const tc = await getTranslations({ locale, namespace: "categories" });
  const pageNum = Math.max(1, Number(page) || 1);

  let titlePart: string;
  let description = t("description");

  if (q?.trim()) {
    titlePart = th("searchTitle", { query: q.trim() });
  } else if (category) {
    const label = tc(category as "other");
    titlePart = th("categoryTitle", { category: label });
    description = th("emptyCategoryDescription");
  } else if (pageNum > 1) {
    titlePart = th("pageTitle", { page: pageNum });
  } else {
    return { title: t("title"), description };
  }

  if (pageNum > 1 && (q?.trim() || category)) {
    titlePart = `${titlePart} · ${th("pageTitle", { page: pageNum })}`;
  }

  return {
    title: `${titlePart} · ${t("title")}`,
    description,
  };
}

export default async function HomePage({
  params,
  searchParams,
}: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { login, q, category, sort, page } = await searchParams;
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");

  return (
    <div className="space-y-6">
      {login === "required" && (
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {t("loginRequired")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {nav("login")}
          </Link>
        </p>
      )}
      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeed
          locale={locale}
          q={q}
          category={category}
          sort={sort}
          page={page}
        />
      </Suspense>
    </div>
  );
}

function HomeFeedSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64 rounded-xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-5 md:grid-cols-12">
        <Skeleton className="h-72 rounded-2xl md:col-span-8" />
        <Skeleton className="h-48 rounded-2xl md:col-span-4" />
        <Skeleton className="h-48 rounded-2xl md:col-span-4" />
      </div>
    </div>
  );
}