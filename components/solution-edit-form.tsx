"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { updateSolution } from "@/actions/solutions";
import { ShellCard } from "@/components/design/shell-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SolutionEditFormProps = {
  solutionId: string;
  challengeId: string;
  defaultValues: {
    content: string;
    githubUrl: string;
    demoUrl: string;
  };
  onSuccessNavigateBack?: boolean;
};

export function SolutionEditForm({
  solutionId,
  challengeId,
  defaultValues,
  onSuccessNavigateBack = false,
}: SolutionEditFormProps) {
  const t = useTranslations("challenge");
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateSolution, null);

  useEffect(() => {
    if (state?.ok && onSuccessNavigateBack) {
      router.push(`/challenges/${challengeId}`);
      router.refresh();
    }
  }, [state, onSuccessNavigateBack, challengeId, router]);

  return (
    <ShellCard innerClassName="p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("editSolution")}</h3>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="solutionId" value={solutionId} />
        <div className="space-y-2">
          <Label htmlFor="content">{t("content")}</Label>
          <Textarea
            id="content"
            name="content"
            required
            rows={5}
            defaultValue={defaultValues.content}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">{t("githubUrl")}</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            required
            defaultValue={defaultValues.githubUrl}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="demoUrl">{t("demoUrl")}</Label>
          <Input
            id="demoUrl"
            name="demoUrl"
            type="url"
            required
            defaultValue={defaultValues.demoUrl}
            className="rounded-xl"
          />
        </div>
        {state && !state.ok ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state?.ok && !onSuccessNavigateBack ? (
          <p className="text-sm text-primary">{t("saved")}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={pending}
            className="rounded-full ease-premium active:scale-[0.98]"
          >
            {t("saveSolution")}
          </Button>
          {onSuccessNavigateBack ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => router.back()}
            >
              {t("cancel")}
            </Button>
          ) : null}
        </div>
      </form>
    </ShellCard>
  );
}