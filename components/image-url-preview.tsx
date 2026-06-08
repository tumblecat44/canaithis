"use client";

import Image from "next/image";

type ImageUrlPreviewProps = {
  url: string;
};

function isPreviewableUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImageUrlPreview({ url }: ImageUrlPreviewProps) {
  if (!isPreviewableUrl(url)) {
    return null;
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-muted/30">
      <Image
        src={url}
        alt=""
        fill
        unoptimized
        className="object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}