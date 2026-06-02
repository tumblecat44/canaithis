"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={theme === "light" ? "Dark mode" : "Light mode"}
      className="rounded-full ease-premium active:scale-[0.98]"
    >
      {theme === "light" ? (
        <MoonIcon weight="light" className="size-4" />
      ) : (
        <SunIcon weight="light" className="size-4" />
      )}
    </Button>
  );
}