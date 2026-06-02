"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createSolution } from "@/actions/solutions";
import { ShellCard } from "@/components/design/shell-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createSolutionSchema,
  type CreateSolutionInput,
} from "@/lib/validations/solution";

type SolutionFormProps = {
  challengeId: string;
};

export function SolutionForm({ challengeId }: SolutionFormProps) {
  const t = useTranslations("challenge");
  const te = useTranslations("errors");
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSolutionInput>({
    resolver: zodResolver(createSolutionSchema),
    defaultValues: { challengeId },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("challengeId", data.challengeId);
      formData.set("content", data.content);
      formData.set("githubUrl", data.githubUrl);
      formData.set("demoUrl", data.demoUrl);

      try {
        const result = await createSolution(null, formData);
        if (result && !result.ok) {
          toast.error(result.error ?? te("generic"));
        }
      } catch (err) {
        if (
          err &&
          typeof err === "object" &&
          "digest" in err &&
          String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
        ) {
          return;
        }
        toast.error(te("generic"));
      }
    });
  });

  return (
    <ShellCard innerClassName="p-6">
      <h3 className="mb-4 text-lg font-semibold">{t("addSolution")}</h3>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <input type="hidden" {...register("challengeId")} />
        <div className="space-y-2">
          <Label htmlFor="content">{t("content")}</Label>
          <Textarea
            id="content"
            rows={5}
            className="rounded-xl"
            placeholder="What worked, models, prompts, steps..."
            {...register("content")}
          />
          {errors.content ? (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">{t("githubUrl")}</Label>
          <Input
            id="githubUrl"
            type="url"
            className="rounded-xl"
            placeholder="https://github.com/..."
            {...register("githubUrl")}
          />
          {errors.githubUrl ? (
            <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="demoUrl">{t("demoUrl")}</Label>
          <Input
            id="demoUrl"
            type="url"
            className="rounded-xl"
            placeholder="https://..."
            {...register("demoUrl")}
          />
          {errors.demoUrl ? (
            <p className="text-sm text-destructive">{errors.demoUrl.message}</p>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="rounded-full ease-premium active:scale-[0.98]"
        >
          {t("addSolution")}
        </Button>
      </form>
    </ShellCard>
  );
}