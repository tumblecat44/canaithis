import { Link } from "@/i18n/navigation";

import { ShellCard } from "@/components/design/shell-card";

type ProfileChallengeCardProps = {
  challengeId: string;
  title: string;
  solutionCountLabel: string;
  actions?: React.ReactNode;
};

export function ProfileChallengeCard({
  challengeId,
  title,
  solutionCountLabel,
  actions,
}: ProfileChallengeCardProps) {
  return (
    <ShellCard
      className="group"
      innerClassName="relative flex items-center justify-between gap-4 p-4"
    >
      <Link
        href={`/challenges/${challengeId}`}
        className="absolute inset-0 z-0 rounded-[calc(1rem-0.375rem)]"
        aria-label={title}
      />
      <div className="relative z-[1] min-w-0 flex-1 pointer-events-none">
        <p className="font-medium transition-colors ease-premium group-hover:text-primary">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{solutionCountLabel}</p>
      </div>
      {actions ? (
        <div className="relative z-[1] flex shrink-0 flex-wrap gap-2 pointer-events-auto">
          {actions}
        </div>
      ) : null}
    </ShellCard>
  );
}