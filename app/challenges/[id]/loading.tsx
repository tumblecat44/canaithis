import { Skeleton } from "@/components/ui/skeleton";

export default function ChallengeLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-2/3 rounded-xl" />
      <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}