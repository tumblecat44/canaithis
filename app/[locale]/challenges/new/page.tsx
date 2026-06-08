import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ChallengeForm } from "@/components/challenge-form";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";

export const dynamic = "force-dynamic";

type NewChallengePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: Pick<NewChallengePageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenge" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("newTitle")} · ${meta("title")}`,
    description: t("newSubtitle"),
    robots: { index: false, follow: false },
  };
}

export default async function NewChallengePage({
  params,
}: NewChallengePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  noStore();
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/challenges/new");
  }

  const t = await getTranslations("challenge");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Reveal>
        <PageHeader
          eyebrow="CanAIThis"
          title={t("newTitle")}
          description={t("newSubtitle")}
        />
      </Reveal>
      <Reveal delay={0.06}>
        <ChallengeForm />
      </Reveal>
    </div>
  );
}