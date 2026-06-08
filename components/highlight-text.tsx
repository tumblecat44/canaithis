type HighlightTextProps = {
  text: string;
  query?: string;
  className?: string;
};

export function HighlightText({ text, query, className }: HighlightTextProps) {
  const trimmed = query?.trim();
  if (!trimmed) {
    return <span className={className}>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return <span className={className}>{text}</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + trimmed.length);
  const after = text.slice(index + trimmed.length);

  return (
    <span className={className}>
      {before}
      <mark className="rounded bg-primary/15 px-0.5 text-foreground">
        {match}
      </mark>
      {after}
    </span>
  );
}