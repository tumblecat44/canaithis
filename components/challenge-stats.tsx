import {
  ChatCircleIcon,
  EyeIcon,
  HeartIcon,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

type ChallengeStatsProps = {
  solutionCount: number;
  totalLikes: number;
  viewCount: number;
};

export async function ChallengeStats({
  solutionCount,
  totalLikes,
  viewCount,
}: ChallengeStatsProps) {
  const t = await getTranslations("challenge");

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <ChatCircleIcon weight="light" className="size-4" />
        {t("solutionCount", { count: solutionCount })}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <HeartIcon weight="light" className="size-4" />
        {t("totalLikes", { count: totalLikes })}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <EyeIcon weight="light" className="size-4" />
        {t("viewCount", { count: viewCount })}
      </span>
    </div>
  );
}