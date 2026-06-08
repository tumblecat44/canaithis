"use client";

import { BookmarkSimpleIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleBookmark } from "@/actions/bookmarks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
  challengeId: string;
  initialBookmarked: boolean;
};

export function BookmarkButton({
  challengeId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const t = useTranslations("challenge");
  const te = useTranslations("errors");
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleBookmark(challengeId);
      if (!result.ok) {
        toast.error(result.error ?? te("unauthorized"));
        return;
      }
      setBookmarked(result.data?.bookmarked ?? false);
      toast.success(
        result.data?.bookmarked ? t("bookmarked") : t("unbookmarked"),
      );
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className={cn(
        "inline-flex gap-1.5 rounded-full",
        bookmarked && "border-primary/40 bg-primary/5 text-primary",
      )}
      onClick={handleClick}
    >
      <BookmarkSimpleIcon
        weight={bookmarked ? "fill" : "light"}
        className="size-4"
      />
      {bookmarked ? t("bookmarked") : t("bookmark")}
    </Button>
  );
}