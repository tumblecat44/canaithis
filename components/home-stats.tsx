import {
  ChatCircleIcon,
  HeartIcon,
  LightbulbIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { ShellCard } from "@/components/design/shell-card";
import { getCommunityStats } from "@/lib/queries/challenges";

export async function HomeStats() {
  const t = await getTranslations("home");
  const stats = await getCommunityStats();

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
      label: t("statLikes"),
      value: stats.likes,
      icon: HeartIcon,
    },
    {
      label: t("statMembers"),
      value: stats.users,
      icon: UsersThreeIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map(({ label, value, icon: Icon }) => (
        <ShellCard key={label} innerClassName="flex items-center gap-3 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon weight="light" className="size-5" />
          </span>
          <div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </ShellCard>
      ))}
    </div>
  );
}