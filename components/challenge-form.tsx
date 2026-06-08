"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createChallenge } from "@/actions/challenges";
import { ImageUrlPreview } from "@/components/image-url-preview";
import { ShellCard } from "@/components/design/shell-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CHALLENGE_CATEGORIES } from "@/lib/constants/categories";
import { createChallengeSchema } from "@/lib/validations/challenge";
import type { z } from "zod";

type ChallengeFormValues = z.input<typeof createChallengeSchema>;
import { cn } from "@/lib/utils";

export function ChallengeForm() {
  const t = useTranslations("challenge");
  const tc = useTranslations("categories");
  const te = useTranslations("errors");
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChallengeFormValues>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      category: CHALLENGE_CATEGORIES[0]?.value ?? "other",
      imageUrl: "",
    },
  });

  const imageUrl = watch("imageUrl") ?? "";

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", data.title);
      formData.set("description", data.description);
      formData.set("category", data.category);
      if (data.imageUrl) formData.set("imageUrl", data.imageUrl);

      try {
        const result = await createChallenge(null, formData);
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
    <ShellCard innerClassName="p-6 md:p-8">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="title">{t("title")}</Label>
          <Input id="title" className="rounded-xl" {...register("title")} />
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t("description")}</Label>
          <Textarea
            id="description"
            rows={6}
            className="rounded-xl"
            {...register("description")}
          />
          {errors.description ? (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">{t("category")}</Label>
          <select
            id="category"
            className={cn(
              "h-9 w-full rounded-xl border border-input bg-background px-3 text-sm",
            )}
            {...register("category")}
          >
            {CHALLENGE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {tc(c.value)}
              </option>
            ))}
          </select>
          {errors.category ? (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">{t("imageUrl")}</Label>
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://"
            className="rounded-xl"
            {...register("imageUrl")}
          />
          {errors.imageUrl ? (
            <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
          ) : null}
          <ImageUrlPreview url={imageUrl} />
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded-full ease-premium active:scale-[0.98] sm:w-auto"
        >
          {t("submit")}
        </Button>
      </form>
    </ShellCard>
  );
}