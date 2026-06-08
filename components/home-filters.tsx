"use client";

import { useTranslations } from "next-intl";

import { ShellCard } from "@/components/design/shell-card";
import { Input } from "@/components/ui/input";
import { CHALLENGE_CATEGORIES } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

export function HomeFilters({
  q,
  category,
  sort,
  page,
}: {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
}) {
  const t = useTranslations("home");
  const tc = useTranslations("categories");

  return (
    <ShellCard innerClassName="p-4 md:p-5">
      <form method="get" className="flex flex-col gap-4 md:flex-row md:items-end">
        {page && Number(page) > 1 ? (
          <input type="hidden" name="page" value={page} />
        ) : null}
        <div className="flex-1 space-y-2">
          <label htmlFor="q" className="sr-only">
            {t("searchPlaceholder")}
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("searchPlaceholder")}
            className="rounded-xl"
          />
        </div>
        <div className="w-full space-y-2 md:w-40">
          <label htmlFor="sort" className="sr-only">
            {t("sortLabel")}
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={
              sort === "popular"
                ? "popular"
                : sort === "views"
                  ? "views"
                  : "latest"
            }
            className={cn(
              "h-9 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            <option value="latest">{t("sortLatest")}</option>
            <option value="popular">{t("sortPopular")}</option>
            <option value="views">{t("sortViews")}</option>
          </select>
        </div>
        <div className="w-full space-y-2 md:w-48">
          <label htmlFor="category" className="sr-only">
            {t("allCategories")}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className={cn(
              "h-9 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            <option value="">{t("allCategories")}</option>
            {CHALLENGE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {tc(c.value)}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all ease-premium active:scale-[0.98] hover:bg-primary/90"
        >
          {t("search")}
        </button>
      </form>
    </ShellCard>
  );
}