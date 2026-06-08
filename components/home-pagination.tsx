import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type HomePaginationProps = {
  page: number;
  totalPages: number;
  q?: string;
  category?: string;
  sort?: string;
};

function buildQuery(
  page: number,
  q?: string,
  category?: string,
  sort?: string,
) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (category) params.set("category", category);
  if (sort === "popular") params.set("sort", "popular");
  if (sort === "views") params.set("sort", "views");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

function toHref(query: string) {
  return query ? `/?${query.replace(/^\?/, "")}` : "/";
}

export async function HomePagination({
  page,
  totalPages,
  q,
  category,
  sort,
}: HomePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const t = await getTranslations("home");
  const prevHref = buildQuery(page - 1, q, category, sort);
  const nextHref = buildQuery(page + 1, q, category, sort);

  return (
    <nav
      aria-label={t("paginationLabel")}
      className="flex items-center justify-center gap-3 pt-2"
    >
      {page > 1 ? (
        <Link
          href={toHref(prevHref)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium transition-all ease-premium hover:bg-muted active:scale-[0.98]"
        >
          <CaretLeftIcon weight="light" className="size-4" />
          {t("prevPage")}
        </Link>
      ) : (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border/50 px-4 py-2 text-sm text-muted-foreground opacity-50",
          )}
        >
          <CaretLeftIcon weight="light" className="size-4" />
          {t("prevPage")}
        </span>
      )}
      <span className="text-sm text-muted-foreground">
        {t("pageOf", { page, total: totalPages })}
      </span>
      {page < totalPages ? (
        <Link
          href={toHref(nextHref)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium transition-all ease-premium hover:bg-muted active:scale-[0.98]"
        >
          {t("nextPage")}
          <CaretRightIcon weight="light" className="size-4" />
        </Link>
      ) : (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-border/50 px-4 py-2 text-sm text-muted-foreground opacity-50",
          )}
        >
          {t("nextPage")}
          <CaretRightIcon weight="light" className="size-4" />
        </span>
      )}
    </nav>
  );
}