import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RouteModal } from "@/components/route-modal";
import { SolutionEditForm } from "@/components/solution-edit-form";
import { prisma } from "@/lib/prisma";

type ModalEditSolutionProps = {
  params: Promise<{ locale: string; id: string; solutionId: string }>;
};

export default async function ModalEditSolutionPage({
  params,
}: ModalEditSolutionProps) {
  const { locale, id, solutionId } = await params;
  setRequestLocale(locale);
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/challenges/${id}/solutions/${solutionId}/edit`);
  }

  const solution = await prisma.solution.findUnique({
    where: { id: solutionId },
    select: {
      id: true,
      challengeId: true,
      authorId: true,
      content: true,
      githubUrl: true,
      demoUrl: true,
    },
  });

  if (!solution || solution.challengeId !== id) {
    notFound();
  }

  if (solution.authorId !== session.user.id) {
    redirect(`/challenges/${id}`);
  }

  return (
    <RouteModal>
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
    </RouteModal>
  );
}