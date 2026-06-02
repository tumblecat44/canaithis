"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function RouteModal({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={() => router.back()}
      />
      <div className="relative z-10 w-full max-w-xl max-h-[min(90dvh,720px)] overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-border/60">
        {children}
      </div>
    </div>
  );
}