import { ListingSkeleton } from "@/components/media/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ListingSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
