import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { ChallengeForm } from "@/components/challenge-form";
import { PageHeader } from "@/components/design/page-header";
import { Reveal } from "@/components/design/reveal";

export const dynamic = "force-dynamic";

export default async function NewChallengePage() {
  noStore();
  const session = await auth();

  if (!session?.user) {
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