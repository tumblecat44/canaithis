import {
  ChatCircleIcon,
  HeartIcon,
  LightbulbIcon,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { ShellCard } from "@/components/design/shell-card";
import { getUserStats } from "@/lib/queries/challenges";

type ProfileStatsProps = {
  userId: string;
};

export async function ProfileStats({ userId }: ProfileStatsProps) {
  const t = await getTranslations("profile");
  const stats = await getUserStats(userId);

  const items = [
    {
      label: t("statChallenges"),
      value: stats.challenges,
      icon: LightbulbIcon,
    },
    {
      label: t("statSolutions"),
      value: stats.solutions,
      icon: ChatCircleIcon,
    },
    {
      label: t("statLikesReceived"),
      value: stats.likesReceived,
      icon: HeartIcon,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, icon: Icon }) => (
        <ShellCard key={label} innerClassName="flex flex-col items-center gap-1 p-4 text-center">
          <Icon weight="light" className="size-5 text-primary" />
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </ShellCard>
      ))}
    </div>
  );
}