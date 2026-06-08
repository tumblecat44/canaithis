"use client";

import { LinkIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  title: string;
};

export function ShareButton({ title }: ShareButtonProps) {
  const t = useTranslations("challenge");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(t("linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="inline-flex gap-1.5 rounded-full"
      onClick={handleShare}
    >
      <LinkIcon weight="light" className="size-4" />
      {copied ? t("linkCopied") : t("share")}
    </Button>
  );
}