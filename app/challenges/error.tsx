"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export default function ChallengesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">{t("generic")}</h2>
      <Button onClick={reset} className="rounded-full">
        {t("retry")}
      </Button>
    </div>
  );
}