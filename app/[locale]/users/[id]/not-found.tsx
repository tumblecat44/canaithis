import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function UserNotFound() {
  const t = await getTranslations("user");

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">{t("notFound")}</p>
      <Link href="/" className={cn(buttonVariants(), "rounded-full")}>
        {t("backHome")}
      </Link>
    </div>
  );
}