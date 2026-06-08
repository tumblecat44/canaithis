import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChallengeCard } from "@/components/design/challenge-card";
import { EmptyState } from "@/components/design/empty-state";
import { ProfileSolutionCard } from "@/components/design/profile-solution-card";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { ShellCard } from "@/components/design/shell-card";
import { Link } from "@/i18n/navigation";
import { getPublicUser } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

function siteBase() {
  return (
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

type PublicUserPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: PublicUserPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const user = await getPublicUser(id);
  const t = await getTranslations({ locale, namespace: "meta" });
  const tu = await getTranslations({ locale, namespace: "user" });
  if (!user) {
    notFound();
  }
  const name = user.name ?? tu("anonymous");
  const description = `${name} · ${t("title")}`;
  const profileUrl = `${siteBase()}/users/${user.id}`;
  return {
    title: `${name} · ${t("title")}`,
    description,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      locale: locale === "ko" ? "ko_KR" : "en_US",
      siteName: t("title"),
      title: name,
      description,
      type: "profile",
      url: profileUrl,
      ...(user.image ? { images: [{ url: user.image }] } : {}),
    },
  };
}

export default async function PublicUserPage({ params }: PublicUserPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("user");
  const tm = await getTranslations("meta");
  const user = await getPublicUser(id);

  if (!user) {
    notFound();
  }

  const base = siteBase();
  const name = user.name ?? t("anonymous");
  const profileUrl = `${base}/users/${user.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name,
        url: profileUrl,
        ...(user.image ? { image: user.image } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: tm("title"),
            item: base,
          },
          {
            "@type": "ListItem",
            position: 2,
            name,
            item: profileUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label={t("breadcrumbLabel")}>
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="transition-colors hover:text-primary"
            >
              {tm("title")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="text-foreground">
              {name}
            </span>
          </li>
        </ol>
      </nav>
      <Reveal>
        <PageHeader title={name} />
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
          <EmptyState
            title={t("noChallenges")}
            description={t("emptyChallengesDescription")}
            actionLabel={t("emptyChallengesBrowseCta")}
            actionHref="/?sort=popular"
            secondaryActionLabel={t("emptyChallengesHomeCta")}
            secondaryActionHref="/"
          />
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
          <EmptyState
            title={t("noSolutions")}
            description={t("emptySolutionsDescription")}
            actionLabel={t("emptySolutionsBrowseCta")}
            actionHref="/?sort=popular"
            secondaryActionLabel={t("emptySolutionsHomeCta")}
            secondaryActionHref="/"
          />
        ) : (
          <div className="space-y-3">
            {user.solutions.map((s) => (
              <ProfileSolutionCard
                key={s.id}
                challengeId={s.challenge.id}
                challengeTitle={s.challenge.title}
                content={s.content}
                githubUrl={s.githubUrl}
                demoUrl={s.demoUrl}
                likeLabel={t("likesOnSolution", { count: s._count.likes })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}