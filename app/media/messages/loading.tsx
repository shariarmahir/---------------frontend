import { ThreadListSkeleton } from "@/components/media/ui/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-card-border bg-white">
      <ThreadListSkeleton />
    </div>
  );
}
