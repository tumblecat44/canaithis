import { Link } from "@/i18n/navigation";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { buttonVariants } from "@/components/ui/button";
import { ShellCard } from "@/components/design/shell-card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
}: EmptyStateProps) {
  return (
    <ShellCard className="py-4">
      <div className="flex flex-col items-center gap-4 px-8 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PlusIcon weight="light" className="size-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && actionHref ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={actionHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full shadow-sm ease-premium active:scale-[0.98]",
              )}
            >
              {actionLabel}
            </Link>
            {secondaryActionLabel && secondaryActionHref ? (
              <Link
                href={secondaryActionHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full ease-premium active:scale-[0.98]",
                )}
              >
                {secondaryActionLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </ShellCard>
  );
}