"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-border bg-popover text-popover-foreground",
        },
      }}
    />
  );
}