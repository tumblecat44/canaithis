import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChallengeCard } from "@/components/design/challenge-card";
import { EmptyState } from "@/components/design/empty-state";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { HomeActiveFilters } from "@/components/home-active-filters";
import { HomeFilters } from "@/components/home-filters";
import { HomePagination } from "@/components/home-pagination";
import { HomeStats } from "@/components/home-stats";
import { TrendingSolutions } from "@/components/trending-solutions";
import {
  getChallenges,
  type ChallengeSort,
} from "@/lib/queries/challenges";
import { cn } from "@/lib/utils";

type HomeFeedProps = {
  locale: string;
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export async function HomeFeed({
  locale,
  q,
  category,
  sort,
  page,
}: HomeFeedProps) {
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const challengeSort: ChallengeSort =
    sort === "popular" ? "popular" : "latest";
  const pageNum = Math.max(1, Number(page) || 1);
  const feed = await getChallenges({
    q,
    category,
    sort: challengeSort,
    page: pageNum,
  });
  const { items: challenges, total, totalPages } = feed;

  return (
    <div className="space-y-10">
      <Reveal>
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
        />
      </Reveal>

      <Reveal delay={0.04}>
        <HomeStats />
      </Reveal>

      <Reveal delay={0.05}>
        <HomeFilters
          q={q}
          category={category}
          sort={sort}
          page={page}
        />
      </Reveal>

      <Reveal delay={0.06}>
        <HomeActiveFilters
          q={q}
          category={category}
          sort={sort}
          total={total}
        />
      </Reveal>

      {!q && !category && pageNum === 1 ? (
        <Reveal delay={0.07}>
          <TrendingSolutions />
        </Reveal>
      ) : null}

      {challenges.length === 0 ? (
        <Reveal delay={0.1}>
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            actionLabel={t("title")}
            actionHref="/challenges/new"
          />
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {challenges.map((challenge, index) => (
            <Reveal
              key={challenge.id}
              delay={0.08 + index * 0.04}
              className={cn(
                index === 0 ? "md:col-span-8 md:row-span-2" : "md:col-span-4",
              )}
            >
              <ChallengeCard
                challenge={challenge}
                featured={index === 0}
                className="h-full"
                highlightQuery={q}
              />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={0.1}>
        <HomePagination
          page={pageNum}
          totalPages={totalPages}
          q={q}
          category={category}
          sort={sort}
        />
      </Reveal>

      <Reveal delay={0.12}>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/challenges/new"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("emptyDescription")}
          </Link>
        </p>
      </Reveal>
    </div>
  );
}