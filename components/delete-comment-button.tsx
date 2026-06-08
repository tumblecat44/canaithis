"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { deleteComment } from "@/actions/comments";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const t = useTranslations("challenge");
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
      onClick={() =>
        startTransition(async () => {
          await deleteComment(commentId);
        })
      }
    >
      {t("deleteComment")}
    </button>
  );
}