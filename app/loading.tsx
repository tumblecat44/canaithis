import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-72 rounded-xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-5 md:grid-cols-12">
        <Skeleton className="h-72 rounded-2xl md:col-span-8" />
        <Skeleton className="h-48 rounded-2xl md:col-span-4" />
      </div>
    </div>
  );
}