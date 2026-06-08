import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";

import { auth } from "@/auth";
import { deleteChallenge } from "@/actions/challenges";
import { deleteSolution } from "@/actions/solutions";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { ShellCard } from "@/components/design/shell-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import {
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

  const [challenges, solutions] = await Promise.all([
    getUserChallenges(userId),
    getUserSolutions(userId),
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
          <div>
            <p className="font-semibold">{session.user?.name ?? "User"}</p>
            <p className="text-sm text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </ShellCard>
      </Reveal>

      <Tabs defaultValue="challenges">
        <TabsList className="rounded-full">
          <TabsTrigger value="challenges" className="rounded-full">
            {t("myChallenges")}
          </TabsTrigger>
          <TabsTrigger value="solutions" className="rounded-full">
            {t("mySolutions")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="challenges" className="mt-4 space-y-3">
          {challenges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("emptyChallenges")}
            </p>
          ) : (
            challenges.map((c) => (
              <ShellCard key={c.id} innerClassName="flex items-center justify-between gap-4 p-4">
                <div>
                  <Link
                    href={`/challenges/${c.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {c.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {t("solutionCount", { count: c._count.solutions })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
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
                </div>
              </ShellCard>
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
              <ShellCard key={s.id} innerClassName="flex items-center justify-between gap-4 p-4">
                <div>
                  <Link
                    href={`/challenges/${s.challenge.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {s.challenge.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {t("likeCount", { count: s._count.likes })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
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
                </div>
              </ShellCard>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}