import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChallengeCard } from "@/components/design/challenge-card";
import { EmptyState } from "@/components/design/empty-state";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { HomeFilters } from "@/components/home-filters";
import { HomeStats } from "@/components/home-stats";
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
};

export async function HomeFeed({ locale, q, category, sort }: HomeFeedProps) {
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const challengeSort: ChallengeSort =
    sort === "popular" ? "popular" : "latest";
  const challenges = await getChallenges({ q, category, sort: challengeSort });

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
        <HomeFilters q={q} category={category} sort={sort} />
      </Reveal>

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
              />
            </Reveal>
          ))}
        </div>
      )}

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