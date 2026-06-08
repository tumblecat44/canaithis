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
import { RelatedChallenges } from "@/components/related-challenges";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getChallengeById } from "@/lib/queries/challenges";

type ChallengeDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: ChallengeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const challenge = await getChallengeById(id);

  if (!challenge) {
    return { title: "CanAIThis" };
  }

  return {
    title: `${challenge.title} · CanAIThis`,
    description: challenge.description.slice(0, 160),
    openGraph: {
      title: challenge.title,
      description: challenge.description.slice(0, 160),
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
  const session = await auth();
  const challenge = await getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="space-y-10">
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
                {t("by")} {challenge.author.name ?? challenge.author.email}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {t("solutionsTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("solutionsSubtitle")}
          </p>
        </div>

        {challenge.solutions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noSolutions")}</p>
        ) : (
          <div className="space-y-4">
            {challenge.solutions.map((solution, i) => (
              <Reveal key={solution.id} delay={0.04 * i}>
                <SolutionCard
                  solution={solution}
                  challengeId={challenge.id}
                  currentUserId={session?.user?.id}
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