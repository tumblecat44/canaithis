import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { auth } from "@/auth";
import { deleteChallenge } from "@/actions/challenges";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { SolutionCard } from "@/components/design/solution-card";
import { ShellCard } from "@/components/design/shell-card";
import { BookmarkButton } from "@/components/bookmark-button";
import { ChallengeStats } from "@/components/challenge-stats";
import { RelatedChallenges } from "@/components/related-challenges";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getChallengeById,
  isChallengeBookmarked,
} from "@/lib/queries/challenges";
import { incrementChallengeView } from "@/lib/queries/users";

type ChallengeDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: ChallengeDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const challenge = await getChallengeById(id);
  const t = await getTranslations({ locale, namespace: "meta" });

  if (!challenge) {
    return { title: t("title") };
  }

  const description = challenge.description.slice(0, 160);

  return {
    title: `${challenge.title} · ${t("title")}`,
    description,
    openGraph: {
      locale: locale === "ko" ? "ko_KR" : "en_US",
      siteName: t("title"),
      title: challenge.title,
      description,
      images: challenge.imageUrl ? [challenge.imageUrl] : undefined,
    },
  };
}

export default async function ChallengeDetailPage({
  params,
}: ChallengeDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("challenge");
  const tc = await getTranslations("categories");
  const tu = await getTranslations("user");
  const session = await auth();
  const challenge = await getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  await incrementChallengeView(id);
  challenge.viewCount += 1;

  const totalLikes = challenge.solutions.reduce(
    (sum, s) => sum + s._count.likes,
    0,
  );
  const bookmarked = session?.user?.id
    ? await isChallengeBookmarked(session.user.id, challenge.id)
    : false;

  const base =
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: challenge.title,
    text: challenge.description,
    datePublished: challenge.createdAt.toISOString(),
    author: {
      "@type": "Person",
      name: challenge.author.name ?? "Anonymous",
    },
    url: `${base}/challenges/${challenge.id}`,
    ...(challenge.imageUrl ? { image: challenge.imageUrl } : {}),
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <PageHeader
          eyebrow={tc(challenge.category as "other")}
          title={challenge.title}
          description={challenge.description}
        />
      </Reveal>

      <Reveal delay={0.05}>
        <ShellCard innerClassName="overflow-hidden p-0">
          {challenge.imageUrl ? (
            <div className="relative aspect-[21/9] w-full bg-muted">
              <Image
                src={challenge.imageUrl}
                alt=""
                fill
                unoptimized
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 1152px"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="rounded-full">
                {tc(challenge.category as "other")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t("by")}{" "}
                <Link
                  href={`/users/${challenge.author.id}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {challenge.author.name ?? challenge.author.email}
                </Link>{" "}
                · {tu("solutionCount", { count: challenge.author._count.solutions })} ·{" "}
                {new Intl.DateTimeFormat(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(challenge.createdAt)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {session?.user ? (
                <BookmarkButton
                  challengeId={challenge.id}
                  initialBookmarked={bookmarked}
                />
              ) : null}
              <ShareButton title={challenge.title} />
              {session?.user?.id === challenge.authorId ? (
                <>
                  <Link
                    href={`/challenges/${challenge.id}/edit`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-full",
                    )}
                  >
                    {t("editChallenge")}
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteChallenge(challenge.id);
                    }}
                  >
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({ variant: "destructive", size: "sm" }),
                        "rounded-full",
                      )}
                    >
                      {t("delete")}
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </ShellCard>
      </Reveal>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("solutionsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("solutionsSubtitle")}
          </p>
          <ChallengeStats
            solutionCount={challenge.solutions.length}
            totalLikes={totalLikes}
            viewCount={challenge.viewCount}
          />
        </div>

        {challenge.solutions.length === 0 ? (
          <ShellCard innerClassName="p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("noSolutions")}</p>
            {session?.user ? (
              <Link
                href={`/challenges/${challenge.id}/solutions/new`}
                className={cn(
                  buttonVariants(),
                  "mt-4 inline-flex rounded-full",
                )}
              >
                {t("beFirstSolution")}
              </Link>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("loginToLike")}
              </p>
            )}
          </ShellCard>
        ) : (
          <div className="space-y-4">
            {challenge.solutions.map((solution, i) => (
              <Reveal key={solution.id} delay={0.04 * i}>
                <SolutionCard
                  solution={solution}
                  challengeId={challenge.id}
                  currentUserId={session?.user?.id}
                  locale={locale}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {session?.user ? (
        <Reveal delay={0.1}>
          <Link
            href={`/challenges/${challenge.id}/solutions/new`}
            className={cn(
              buttonVariants(),
              "inline-flex rounded-full ease-premium active:scale-[0.98]",
            )}
          >
            {t("addSolution")}
          </Link>
        </Reveal>
      ) : (
        <p className="text-sm text-muted-foreground">{t("loginToLike")}</p>
      )}

      <RelatedChallenges
        challengeId={challenge.id}
        category={challenge.category}
      />
    </div>
  );
}