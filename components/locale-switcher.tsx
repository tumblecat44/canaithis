"use client";

import { useLocale } from "next-intl";

import { setLocale } from "@/actions/locale";
import { type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;

  return (
    <div className="flex items-center rounded-full border border-border/80 bg-background/60 p-0.5 text-xs font-medium">
      {(["ko", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase tracking-wide transition-all ease-premium active:scale-[0.98]",
            locale === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}