import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { auth } from "@/auth";
import { SolutionEditForm } from "@/components/solution-edit-form";
import { PageHeader } from "@/components/design/page-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type EditSolutionPageProps = {
  params: Promise<{ locale: string; id: string; solutionId: string }>;
};

export async function generateMetadata({
  params,
}: Pick<EditSolutionPageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "challenge" });
  const meta = await getTranslations({ locale, namespace: "meta" });

  return {
    title: `${t("editSolution")} · ${meta("title")}`,
    description: t("editSolutionSubtitle"),
    robots: { index: false, follow: false },
  };
}

export default async function EditSolutionPage({ params }: EditSolutionPageProps) {
  const { locale, id, solutionId } = await params;
  setRequestLocale(locale);
  const session = await auth();
  const t = await getTranslations("challenge");

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/challenges/${id}/solutions/${solutionId}/edit`);
  }

  const solution = await prisma.solution.findUnique({
    where: { id: solutionId },
    include: { challenge: { select: { id: true, title: true } } },
  });

  if (!solution || solution.challengeId !== id) {
    notFound();
  }

  if (solution.authorId !== session.user.id) {
    redirect(`/challenges/${id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href={`/challenges/${id}`}
        className="text-sm text-muted-foreground hover:text-primary"
      >
        ← {solution.challenge.title}
      </Link>
      <PageHeader title={t("editSolution")} />
      <SolutionEditForm
        solutionId={solution.id}
        challengeId={id}
        defaultValues={{
          content: solution.content,
          githubUrl: solution.githubUrl,
          demoUrl: solution.demoUrl,
        }}
        onSuccessNavigateBack
      />
    </div>
  );
}