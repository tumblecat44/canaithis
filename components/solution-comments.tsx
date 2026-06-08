"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createComment } from "@/actions/comments";
import { DeleteCommentButton } from "@/components/delete-comment-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type CommentData = {
  id: string;
  content: string;
  createdAt: Date | string;
  author: { id: string; name: string | null };
};

type SolutionCommentsProps = {
  solutionId: string;
  comments: CommentData[];
  currentUserId?: string;
  locale: string;
};

export function SolutionComments({
  solutionId,
  comments,
  currentUserId,
  locale,
}: SolutionCommentsProps) {
  const t = useTranslations("challenge");
  const [state, formAction, pending] = useActionState(createComment, null);

  return (
    <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("commentsTitle")} ({comments.length})
      </p>
      {comments.length > 0 ? (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl bg-muted/40 px-3 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground/90">
                  {comment.author.name ?? t("by")}
                </p>
                {currentUserId === comment.author.id ? (
                  <DeleteCommentButton commentId={comment.id} />
                ) : null}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {comment.content}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {new Intl.DateTimeFormat(locale, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(comment.createdAt))}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">{t("noComments")}</p>
      )}
      {currentUserId ? (
        <form action={formAction} className="space-y-2">
          <input type="hidden" name="solutionId" value={solutionId} />
          <Textarea
            name="content"
            rows={2}
            required
            placeholder={t("commentPlaceholder")}
            className="rounded-xl text-sm"
          />
          {state && !state.ok ? (
            <p className="text-xs text-destructive">{state.error}</p>
          ) : null}
          <Button
            type="submit"
            size="sm"
            disabled={pending}
            className="rounded-full"
          >
            {t("addComment")}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">{t("loginToComment")}</p>
      )}
    </div>
  );
}