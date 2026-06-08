import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ShellCard } from "@/components/design/shell-card";
import { Reveal } from "@/components/design/reveal";
import { getTrendingSolutions } from "@/lib/queries/challenges";

export async function TrendingSolutions() {
  const t = await getTranslations("home");
  const solutions = await getTrendingSolutions(3);

  if (solutions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        {t("trendingTitle")}
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {solutions.map((solution, i) => (
          <Reveal key={solution.id} delay={0.03 * i}>
            <Link href={`/challenges/${solution.challenge.id}`}>
              <ShellCard
                innerClassName="flex h-full flex-col gap-2 p-4 transition-transform duration-500 ease-premium hover:-translate-y-0.5"
              >
                <p className="line-clamp-1 text-xs font-medium text-primary">
                  {solution.challenge.title}
                </p>
                <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {solution.content}
                </p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <HeartIcon weight="fill" className="size-3.5 text-primary" />
                  {solution._count.likes} {t("trendingLikes")}
                </span>
              </ShellCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}