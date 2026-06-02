import { cn } from "@/lib/utils";

type ShellCardProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

export function ShellCard({
  children,
  className,
  innerClassName,
}: ShellCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-1.5 ring-1 ring-border/60 bg-muted/30 shadow-[var(--shadow-shell)]",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-[calc(1rem-0.375rem)] bg-card shadow-[var(--shadow-ambient)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}