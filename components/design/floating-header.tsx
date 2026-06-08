import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import { AuthButtons } from "@/components/auth-buttons";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function FloatingHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 pb-2">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border border-white/40 bg-background/75 px-3 shadow-[var(--shadow-ambient)] backdrop-blur-xl dark:border-white/10",
        )}
      >
        <Link
          href="/"
          className="px-2 text-sm font-semibold tracking-tight text-foreground"
        >
          {t("brand")}
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/challenges/new"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden rounded-full sm:inline-flex",
            )}
          >
            {t("newChallenge")}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
          <AuthButtons />
        </nav>
      </div>
    </header>
  );
}