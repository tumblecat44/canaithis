"use client";

import { useTranslations } from "next-intl";

type GithubUrlPreviewProps = {
  url: string;
};

function isValidHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function GithubUrlPreview({ url }: GithubUrlPreviewProps) {
  const t = useTranslations("challenge");

  if (!isValidHttpUrl(url)) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex text-sm font-medium text-primary hover:underline"
    >
      {t("previewGithub")} →
    </a>
  );
}