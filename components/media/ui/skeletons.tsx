import { Skeleton } from "@/components/ui/skeleton";

/** Placeholders shaped like the real surfaces, so nothing jumps on load. */

export function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-card-border bg-white p-4 sm:p-6" role="status" aria-label="লোড হচ্ছে">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3.5 w-full" />
      <Skeleton className="mt-2 h-3.5 w-4/5" />
      <Skeleton className="mt-4 aspect-video w-full rounded-xl" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-white" role="status" aria-label="লোড হচ্ছে">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="লোড হচ্ছে">
      <div className="rounded-2xl border border-card-border bg-white p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-24 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3.5 w-72 max-w-full" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ThreadListSkeleton() {
  return (
    <div className="space-y-1 p-2" role="status" aria-label="লোড হচ্ছে">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WalletSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="লোড হচ্ছে">
      <Skeleton className="h-40 rounded-2xl" />
      <div className="space-y-3 rounded-2xl border border-card-border bg-white p-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-52" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
