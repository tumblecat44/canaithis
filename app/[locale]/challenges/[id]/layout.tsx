import { notFound } from "next/navigation";

import { getChallengeById } from "@/lib/queries/challenges";

type ChallengeDetailLayoutProps = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
  modal: React.ReactNode;
};

export default async function ChallengeDetailLayout({
  params,
  children,
  modal,
}: ChallengeDetailLayoutProps) {
  const { id } = await params;
  const challenge = await getChallengeById(id);
  if (!challenge) {
    notFound();
  }

  return (
    <>
      {children}
      {modal}
    </>
  );
}