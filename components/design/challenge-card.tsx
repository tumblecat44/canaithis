import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowUpRightIcon, ChatCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { getLocale, getTranslations } from "next-intl/server";

import { HighlightText } from "@/components/highlight-text";
import { ShellCard } from "@/components/design/shell-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ChallengeCardData = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  createdAt: Date;
  author: { name: string | null; image: string | null };
  _count: { solutions: number };
};

type ChallengeCardProps = {
  challenge: ChallengeCardData;
  featured?: boolean;
  className?: string;
  highlightQuery?: string;
};

export async function ChallengeCard({
  challenge,
  featured = false,
  className,
  highlightQuery,
}: ChallengeCardProps) {
  const t = await getTranslations();
  const locale = await getLocale();
  const excerpt =
    challenge.description.length > 140
      ? `${challenge.description.slice(0, 140)}…`
      : challenge.description;

  return (
    <Link href={`/challenges/${challenge.id}`} className={cn("group block", className)}>
      <ShellCard
        className={cn(
          "h-full transition-transform duration-500 ease-premium group-hover:-translate-y-0.5",
          featured && "md:min-h-[280px]",
        )}
        innerClassName="flex h-full flex-col overflow-hidden p-0"
      >
        {challenge.imageUrl ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            <Image
              src={challenge.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.02]"
              sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="rounded-full">
              {t(`categories.${challenge.category}` as "categories.other")}
            </Badge>
            {featured ? (
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary">
                {t("home.featured")}
              </span>
            ) : null}
          </div>
          <h2
            className={cn(
              "font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors ease-premium",
              featured ? "text-xl md:text-2xl" : "text-lg",
            )}
          >
            <HighlightText text={challenge.title} query={highlightQuery} />
          </h2>
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            <HighlightText text={excerpt} query={highlightQuery} />
          </p>
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ChatCircleIcon weight="light" className="size-4" />
                {challenge._count.solutions} {t("home.solutions")}
              </span>
              <span>
                {challenge.author.name ?? t("challenge.by")} ·{" "}
                {new Intl.DateTimeFormat(locale, {
                  month: "short",
                  day: "numeric",
                }).format(challenge.createdAt)}
              </span>
            </div>
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-500 ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-px">
              <ArrowUpRightIcon weight="light" className="size-4" />
            </span>
          </div>
        </div>
      </ShellCard>
    </Link>
  );
}