import { XIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

type HomeActiveFiltersProps = {
  q?: string;
  category?: string;
  sort?: string;
  total: number;
};

export async function HomeActiveFilters({
  q,
  category,
  sort,
  total,
}: HomeActiveFiltersProps) {
  const t = await getTranslations("home");
  const tc = await getTranslations("categories");
  const hasFilters = Boolean(q?.trim() || category || sort === "popular");

  if (!hasFilters && total === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {t("resultCount", { count: total })}
      </p>
      {hasFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          {q?.trim() ? (
            <Badge variant="secondary" className="rounded-full gap-1.5 px-3 py-1">
              {t("search")}: {q.trim()}
            </Badge>
          ) : null}
          {category ? (
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {tc(category as "other")}
            </Badge>
          ) : null}
          {sort === "popular" ? (
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {t("sortPopular")}
            </Badge>
          ) : null}
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon weight="light" className="size-3.5" />
            {t("clearFilters")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}