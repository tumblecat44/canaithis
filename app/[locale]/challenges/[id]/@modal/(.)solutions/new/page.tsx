import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RouteModal } from "@/components/route-modal";
import { SolutionForm } from "@/components/solution-form";
import { getChallengeById } from "@/lib/queries/challenges";

type ModalNewSolutionProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ModalNewSolutionPage({
  params,
}: ModalNewSolutionProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
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