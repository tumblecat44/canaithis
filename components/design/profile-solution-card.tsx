import { GithubLogoIcon, LinkIcon } from "@phosphor-icons/react/dist/ssr";

import { Link } from "@/i18n/navigation";

import { SolutionSnippet } from "@/components/design/solution-snippet";
import { ShellCard } from "@/components/design/shell-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProfileSolutionCardProps = {
  challengeId: string;
  challengeTitle: string;
  content: string;
  githubUrl: string;
  demoUrl: string;
  likeLabel: string;
  actions?: React.ReactNode;
};

export function ProfileSolutionCard({
  challengeId,
  challengeTitle,
  content,
  githubUrl,
  demoUrl,
  likeLabel,
  actions,
}: ProfileSolutionCardProps) {
  return (
    <ShellCard
      className="group"
      innerClassName="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <Link
        href={`/challenges/${challengeId}`}
        className="absolute inset-0 z-0 rounded-[calc(1rem-0.375rem)]"
        aria-label={challengeTitle}
      />
      <div className="relative z-[1] min-w-0 flex-1 space-y-2 pointer-events-none">
        <p className="font-medium transition-colors ease-premium group-hover:text-primary">
          {challengeTitle}
        </p>
        <SolutionSnippet content={content} />
        <p className="text-xs text-muted-foreground">{likeLabel}</p>
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex gap-1.5 rounded-full",
            )}
          >
            <GithubLogoIcon weight="light" className="size-4" />
            GitHub
          </a>
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex gap-1.5 rounded-full",
            )}
          >
            <LinkIcon weight="light" className="size-4" />
            Demo
          </a>
        </div>
      </div>
      {actions ? (
        <div className="relative z-[1] flex shrink-0 flex-wrap gap-2 pointer-events-auto">
          {actions}
        </div>
      ) : null}
    </ShellCard>
  );
}