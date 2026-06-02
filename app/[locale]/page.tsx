import { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { HomeFeed } from "@/components/home-feed";
import { Skeleton } from "@/components/ui/skeleton";

type HomePageProps = {
  searchParams: Promise<{
    login?: string;
    q?: string;
    category?: string;
    sort?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { login, q, category, sort } = await searchParams;
  const t = await getTranslations("home");

  return (
    <div className="space-y-6">
      {login === "required" && (
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {t("loginRequired")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}
      <Suspense fallback={<HomeFeedSkeleton />}>
        <HomeFeed q={q} category={category} sort={sort} />
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