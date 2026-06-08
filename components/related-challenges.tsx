import { getTranslations } from "next-intl/server";

import { ChallengeCard } from "@/components/design/challenge-card";
import { Reveal } from "@/components/design/reveal";
import { getRelatedChallenges } from "@/lib/queries/challenges";

type RelatedChallengesProps = {
  challengeId: string;
  category: string;
};

export async function RelatedChallenges({
  challengeId,
  category,
}: RelatedChallengesProps) {
  const t = await getTranslations("challenge");
  const related = await getRelatedChallenges(challengeId, category);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 border-t border-border/60 pt-10">
      <h2 className="text-xl font-semibold tracking-tight">
        {t("relatedTitle")}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {related.map((challenge, i) => (
          <Reveal key={challenge.id} delay={0.04 * i}>
            <ChallengeCard challenge={challenge} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}