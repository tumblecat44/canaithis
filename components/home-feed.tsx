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
import { RecentActivity } from "@/components/recent-activity";
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
    sort === "popular"
      ? "popular"
      : sort === "views"
        ? "views"
        : "latest";
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

      {!q && !category && pageNum === 1 && challengeSort === "latest" ? (
        <>
          <Reveal delay={0.07}>
            <TrendingSolutions />
          </Reveal>
          <Reveal delay={0.08}>
            <RecentActivity locale={locale} />
          </Reveal>
        </>
      ) : null}

      {challenges.length === 0 ? (
        <Reveal delay={0.1}>
          <EmptyState
            title={
              q?.trim() || category
                ? t("emptySearchTitle")
                : t("emptyTitle")
            }
            description={
              q?.trim()
                ? t("emptySearchDescription", { query: q.trim() })
                : category
                  ? t("emptyCategoryDescription")
                  : t("emptyDescription")
            }
            actionLabel={
              q?.trim() || category ? t("clearFilters") : t("emptyCta")
            }
            actionHref={q?.trim() || category ? "/" : "/challenges/new"}
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

      {challenges.length > 0 ? (
        <Reveal delay={0.12}>
          <p className="text-center">
            <Link
              href="/challenges/new"
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]",
              )}
            >
              {t("postAnotherCta")}
            </Link>
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}