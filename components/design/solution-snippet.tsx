import { cn } from "@/lib/utils";

type SolutionSnippetProps = {
  content: string;
  className?: string;
};

export function SolutionSnippet({ content, className }: SolutionSnippetProps) {
  const trimmed = content.trim();
  if (!trimmed) {
    return null;
  }

  return (
    <p className={cn("line-clamp-1 text-sm text-muted-foreground", className)}>
      {trimmed}
    </p>
  );
}