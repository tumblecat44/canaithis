import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { ChallengeForm } from "@/components/challenge-form";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";

export default async function NewChallengePage() {
  const session = await auth();
  if (!session?.user?.id) {
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