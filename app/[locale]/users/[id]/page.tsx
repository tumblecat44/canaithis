import Image from "next/image";
import { GithubLogoIcon, LinkIcon } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { ChallengeCard } from "@/components/design/challenge-card";
import { SolutionSnippet } from "@/components/design/solution-snippet";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { ShellCard } from "@/components/design/shell-card";
import { buttonVariants } from "@/components/ui/button";
import { getPublicUser } from "@/lib/queries/users";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PublicUserPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: PublicUserPageProps) {
  const { locale, id } = await params;
  const user = await getPublicUser(id);
  const t = await getTranslations({ locale, namespace: "meta" });
  const tu = await getTranslations({ locale, namespace: "user" });
  if (!user) {
    notFound();
  }
  const name = user.name ?? tu("anonymous");
  const description = `${name} · ${t("title")}`;
  return {
    title: `${name} · ${t("title")}`,
    description,
    openGraph: {
      locale: locale === "ko" ? "ko_KR" : "en_US",
      siteName: t("title"),
      title: name,
      description,
      type: "profile",
      ...(user.image ? { images: [{ url: user.image }] } : {}),
    },
  };
}

export default async function PublicUserPage({ params }: PublicUserPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("user");
  const user = await getPublicUser(id);

  if (!user) {
    notFound();
  }

  const base =
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.name ?? t("anonymous"),
    url: `${base}/users/${user.id}`,
    ...(user.image ? { image: user.image } : {}),
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Reveal>
        <PageHeader title={user.name ?? t("anonymous")} />
      </Reveal>

      <Reveal delay={0.05}>
        <ShellCard innerClassName="flex items-center gap-4 p-6">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={64}
              height={64}
              className="size-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-medium">
              {(user.name ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {t("memberSince", {
                date: new Intl.DateTimeFormat(locale, {
                  year: "numeric",
                  month: "long",
                }).format(user.createdAt),
              })}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span>{t("challengeCount", { count: user._count.challenges })}</span>
              <span>{t("solutionCount", { count: user._count.solutions })}</span>
              <span>{t("likesReceived", { count: user.likesReceived })}</span>
            </div>
          </div>
        </ShellCard>
      </Reveal>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("challenges")}</h2>
        {user.challenges.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noChallenges")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {user.challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("solutions")}</h2>
        {user.solutions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noSolutions")}</p>
        ) : (
          <div className="space-y-3">
            {user.solutions.map((s) => (
              <ShellCard key={s.id} innerClassName="space-y-2 p-4">
                <Link
                  href={`/challenges/${s.challenge.id}`}
                  className="font-medium hover:text-primary"
                >
                  {s.challenge.title}
                </Link>
                <SolutionSnippet content={s.content} />
                <p className="text-xs text-muted-foreground">
                  {t("likesOnSolution", { count: s._count.likes })}
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={s.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "inline-flex gap-1.5 rounded-full",
                    )}
                  >
                    <GithubLogoIcon weight="light" className="size-4" />
                    GitHub
                  </a>
                  <a
                    href={s.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "inline-flex gap-1.5 rounded-full",
                    )}
                  >
                    <LinkIcon weight="light" className="size-4" />
                    Demo
                  </a>
                </div>
              </ShellCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}