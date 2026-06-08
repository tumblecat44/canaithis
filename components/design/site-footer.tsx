import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-border/60 px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
        <p>{t("tagline")}</p>
        <nav className="flex gap-4">
          <Link href="/" className="hover:text-primary">
            {t("home")}
          </Link>
          <Link href="/challenges/new" className="hover:text-primary">
            {t("newChallenge")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}