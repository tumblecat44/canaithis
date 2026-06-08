"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { updateChallenge } from "@/actions/challenges";
import { ShellCard } from "@/components/design/shell-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUrlPreview } from "@/components/image-url-preview";
import { CHALLENGE_CATEGORIES } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

type ChallengeEditFormProps = {
  challengeId: string;
  defaultValues: {
    title: string;
    description: string;
    category: string;
    imageUrl: string;
  };
};

export function ChallengeEditForm({
  challengeId,
  defaultValues,
}: ChallengeEditFormProps) {
  const t = useTranslations("challenge");
  const tc = useTranslations("categories");
  const te = useTranslations("errors");
  const router = useRouter();
  const boundUpdate = updateChallenge.bind(null, challengeId);
  const [state, formAction, pending] = useActionState(boundUpdate, null);
  const [imageUrl, setImageUrl] = useState(defaultValues.imageUrl);

  useEffect(() => {
    if (state?.ok) {
      router.push(`/challenges/${challengeId}`);
      router.refresh();
    }
  }, [state, challengeId, router]);

  return (
    <ShellCard innerClassName="p-6 md:p-8">
      <form action={formAction} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="title">{t("title")}</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={defaultValues.title}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">{t("description")}</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={6}
            defaultValue={defaultValues.description}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">{t("category")}</Label>
          <select
            id="category"
            name="category"
            defaultValue={defaultValues.category}
            className={cn(
              "h-9 w-full rounded-xl border border-input bg-background px-3 text-sm",
            )}
          >
            {CHALLENGE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {tc(c.value)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">{t("imageUrl")}</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="rounded-xl"
          />
          <ImageUrlPreview url={imageUrl} />
        </div>
        {state && !state.ok ? (
          <p className="text-sm text-destructive">
            {state.error ?? te("generic")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={pending}
            className="rounded-full ease-premium active:scale-[0.98]"
          >
            {t("saveChallenge")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => router.push(`/challenges/${challengeId}`)}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </ShellCard>
  );
}