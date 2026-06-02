import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { RouteModal } from "@/components/route-modal";
import { SolutionForm } from "@/components/solution-form";
import { getChallengeById } from "@/lib/queries/challenges";

type ModalNewSolutionProps = {
  params: Promise<{ id: string }>;
};

export default async function ModalNewSolutionPage({
  params,
}: ModalNewSolutionProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/challenges/${id}/solutions/new`);
  }

  const challenge = await getChallengeById(id);

  if (!challenge) {
    notFound();
  }

  return (
    <RouteModal>
      <SolutionForm challengeId={id} />
    </RouteModal>
  );
}