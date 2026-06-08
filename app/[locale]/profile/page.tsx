import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";

import { auth } from "@/auth";
import { deleteChallenge } from "@/actions/challenges";
import { deleteSolution } from "@/actions/solutions";
import { PageHeader } from "@/components/design/page-header";
import { ProfileStats } from "@/components/profile-stats";
import { Reveal } from "@/components/design/reveal";
import { EmptyState } from "@/components/design/empty-state";
import { ShellCard } from "@/components/design/shell-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { BookmarkButton } from "@/components/bookmark-button";
import { ChallengeCard } from "@/components/design/challenge-card";
import { ProfileChallengeCard } from "@/components/design/profile-challenge-card";
import { ProfileSolutionCard } from "@/components/design/profile-solution-card";
import {
  getUserBookmarks,
  getUserChallenges,
  getUserSolutions,
} from "@/lib/queries/challenges";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const t = await getTranslations("profile");
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/profile");
  }

  const [challenges, solutions, bookmarks] = await Promise.all([
    getUserChallenges(userId),
    getUserSolutions(userId),
    getUserBookmarks(userId),
  ]);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageHeader title={t("title")} />
      </Reveal>

      <Reveal delay={0.05}>
        <ShellCard innerClassName="flex items-center gap-4 p-6">
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-lg font-medium">
              {(session.user?.name ?? session.user?.email ?? "?")
                .slice(0, 1)
                .toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <p className="font-semibold">{session.user?.name ?? "User"}</p>
            <p className="text-sm text-muted-foreground">
              {session.user?.email}
            </p>
            <Link
              href={`/users/${userId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("publicProfile")} →
            </Link>
          </div>
        </ShellCard>
      </Reveal>

      <Reveal delay={0.06}>
        <ProfileStats userId={userId} />
      </Reveal>

      <Tabs defaultValue="challenges">
        <TabsList className="rounded-full">
          <TabsTrigger value="challenges" className="rounded-full">
            {t("myChallenges")}
          </TabsTrigger>
          <TabsTrigger value="solutions" className="rounded-full">
            {t("mySolutions")}
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="rounded-full">
            {t("myBookmarks")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="challenges" className="mt-4 space-y-3">
          {challenges.length === 0 ? (
            <EmptyState
              title={t("emptyChallenges")}
              description={t("emptyChallengesDescription")}
              actionLabel={t("emptyChallengesPostCta")}
              actionHref="/challenges/new"
              secondaryActionLabel={t("emptyChallengesBrowseCta")}
              secondaryActionHref="/"
            />
          ) : (
            challenges.map((c) => (
              <ProfileChallengeCard
                key={c.id}
                challengeId={c.id}
                title={c.title}
                solutionCountLabel={t("solutionCount", {
                  count: c._count.solutions,
                })}
                actions={
                  <>
                    <Link
                      href={`/challenges/${c.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-full",
                      )}
                    >
                      {t("edit")}
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteChallenge(c.id);
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
                }
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="solutions" className="mt-4 space-y-3">
          {solutions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("emptySolutions")}
            </p>
          ) : (
            solutions.map((s) => (
              <ProfileSolutionCard
                key={s.id}
                challengeId={s.challenge.id}
                challengeTitle={s.challenge.title}
                content={s.content}
                githubUrl={s.githubUrl}
                demoUrl={s.demoUrl}
                likeLabel={t("likeCount", { count: s._count.likes })}
                actions={
                  <>
                    <Link
                      href={`/challenges/${s.challenge.id}/solutions/${s.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "rounded-full",
                      )}
                    >
                      {t("edit")}
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteSolution(s.id);
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
                }
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="bookmarks" className="mt-4 space-y-3">
          {bookmarks.length === 0 ? (
            <EmptyState
              title={t("emptyBookmarks")}
              description={t("emptyBookmarksDescription")}
              actionLabel={t("emptyBookmarksExploreCta")}
              actionHref="/?sort=popular"
              secondaryActionLabel={t("emptyBookmarksHomeCta")}
              secondaryActionHref="/"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bookmarks.map((b) => (
                <ChallengeCard
                  key={b.id}
                  challenge={b.challenge}
                  fullCardClick
                  actions={
                    <BookmarkButton
                      challengeId={b.challenge.id}
                      initialBookmarked
                    />
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}