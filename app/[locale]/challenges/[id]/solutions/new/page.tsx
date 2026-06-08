import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { auth } from "@/auth";
import { SolutionForm } from "@/components/solution-form";
import { PageHeader } from "@/components/design/page-header";
import { getChallengeById } from "@/lib/queries/challenges";

export const dynamic = "force-dynamic";

type NewSolutionPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: Pick<NewSolutionPageProps, "params">): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "challenge" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  const challenge = await getChallengeById(id);

  const description = challenge
    ? `${t("addSolutionSubtitle")} — ${challenge.title}`
    : t("addSolutionSubtitle");

  return {
    title: `${t("addSolution")} · ${meta("title")}`,
    description,
    robots: { index: false, follow: false },
  };
}

export default async function NewSolutionPage({ params }: NewSolutionPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/challenges/${id}/solutions/new`);
  }

  const t = await getTranslations("challenge");
  const challenge = await getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/challenges/${id}`}
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← {challenge.title}
      </Link>
      <PageHeader title={t("addSolution")} description={challenge.title} />
      <SolutionForm challengeId={id} />
    </div>
  );
}