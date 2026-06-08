import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { ShellCard } from "@/components/design/shell-card";
import { Reveal } from "@/components/design/reveal";
import { getRecentActivity } from "@/lib/queries/challenges";

type RecentActivityProps = {
  locale: string;
};

export async function RecentActivity({ locale }: RecentActivityProps) {
  const t = await getTranslations("home");
  const items = await getRecentActivity(6);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        {t("activityTitle")}
      </h2>
      <ShellCard innerClassName="divide-y divide-border/60 p-0">
        {items.map((item, i) => (
          <Reveal key={`${item.type}-${item.id}`} delay={0.02 * i}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">
                  {item.type === "challenge"
                    ? t("activityChallenge")
                    : t("activitySolution")}
                  {item.authorName ? ` · ${item.authorName}` : ""}
                </span>
                <Link
                  href={item.href}
                  className="mt-0.5 block truncate font-medium hover:text-primary"
                >
                  {item.title}
                </Link>
              </div>
              <time
                dateTime={item.createdAt.toISOString()}
                className="shrink-0 text-xs text-muted-foreground"
              >
                {new Intl.DateTimeFormat(locale, {
                  month: "short",
                  day: "numeric",
                }).format(item.createdAt)}
              </time>
            </div>
          </Reveal>
        ))}
      </ShellCard>
    </section>
  );
}