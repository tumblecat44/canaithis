import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { SolutionEditForm } from "@/components/solution-edit-form";
import { PageHeader } from "@/components/design/page-header";
import { prisma } from "@/lib/prisma";

type EditSolutionPageProps = {
  params: Promise<{ id: string; solutionId: string }>;
};

export default async function EditSolutionPage({ params }: EditSolutionPageProps) {
  const { id, solutionId } = await params;
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