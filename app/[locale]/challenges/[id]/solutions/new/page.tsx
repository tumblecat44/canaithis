import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";

import { auth } from "@/auth";
import { SolutionForm } from "@/components/solution-form";
import { PageHeader } from "@/components/design/page-header";
import { getChallengeById } from "@/lib/queries/challenges";

type NewSolutionPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

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