import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/auth";
import { ChallengeEditForm } from "@/components/challenge-edit-form";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";
import { getChallengeById } from "@/lib/queries/challenges";

export const dynamic = "force-dynamic";

type ChallengeEditPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: Pick<ChallengeEditPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenge" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("editChallenge")} · ${meta("title")}`,
    description: t("editChallengeSubtitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ChallengeEditPage({
  params,
}: ChallengeEditPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/challenges/${id}/edit`);
  }

  const challenge = await getChallengeById(id);
  if (!challenge) {
    notFound();
  }

  if (challenge.authorId !== session.user.id) {
    redirect(`/challenges/${id}`);
  }

  const t = await getTranslations("challenge");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Reveal>
        <PageHeader
          eyebrow="CanAIThis"
          title={t("editChallenge")}
          description={t("editChallengeSubtitle")}
        />
      </Reveal>
      <Reveal delay={0.06}>
        <ChallengeEditForm
          challengeId={challenge.id}
          defaultValues={{
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
            imageUrl: challenge.imageUrl ?? "",
          }}
        />
      </Reveal>
    </div>
  );
}