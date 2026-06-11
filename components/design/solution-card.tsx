import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { GithubLogoIcon, LinkIcon, HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { toggleLike } from "@/actions/likes";
import { ShellCard } from "@/components/design/shell-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SolutionCardData = {
  id: string;
  content: string;
  githubUrl: string | null;
  demoUrl: string | null;
  author: { id: string; name: string | null; image: string | null };
  _count: { likes: number };
  likes: { userId: string }[];
};

type SolutionCardProps = {
  solution: SolutionCardData;
  challengeId: string;
  currentUserId?: string;
};

export async function SolutionCard({
  solution,
  challengeId,
  currentUserId,
}: SolutionCardProps) {
  const t = await getTranslations("challenge");
  const liked = currentUserId
    ? solution.likes.some((l) => l.userId === currentUserId)
    : false;

  return (
    <ShellCard innerClassName="p-5 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {solution.author.image ? (
              <Image
                src={solution.author.image}
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {(solution.author.name ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <Link
              href={`/users/${solution.author.id}`}
              className="text-sm font-medium hover:text-primary"
            >
              {solution.author.name ?? t("by")}
            </Link>
          </div>
          <span className="text-sm text-muted-foreground">
            {solution._count.likes} {t("likes")}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {solution.content}
        </p>
        {solution.githubUrl || solution.demoUrl ? (
          <div className="flex flex-wrap gap-2">
            {solution.githubUrl ? (
              <Link
                href={solution.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "inline-flex gap-1.5 rounded-full",
                )}
              >
                <GithubLogoIcon weight="light" className="size-4" />
                GitHub
              </Link>
            ) : null}
            {solution.demoUrl ? (
              <Link
                href={solution.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "inline-flex gap-1.5 rounded-full",
                )}
              >
                <LinkIcon weight="light" className="size-4" />
                Demo
              </Link>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {currentUserId ? (
            <form
              action={async () => {
                "use server";
                await toggleLike(solution.id, challengeId);
              }}
            >
              <button
                type="submit"
                className={cn(
                  buttonVariants({
                    variant: liked ? "default" : "outline",
                    size: "sm",
                  }),
                  "inline-flex gap-1.5 rounded-full ease-premium active:scale-[0.98]",
                )}
              >
                <HeartIcon
                  weight={liked ? "fill" : "light"}
                  className="size-4"
                />
                {liked ? t("liked") : t("like")}
              </button>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">{t("loginToLike")}</p>
          )}
          {currentUserId === solution.author.id ? (
            <Link
              href={`/challenges/${challengeId}/solutions/${solution.id}/edit`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-full",
              )}
            >
              {t("editSolution")}
            </Link>
          ) : null}
        </div>
      </div>
    </ShellCard>
  );
}
