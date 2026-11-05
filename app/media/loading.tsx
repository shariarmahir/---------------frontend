import { FeedSkeleton } from "@/components/media/ui/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-170">
      <FeedSkeleton count={3} />
    </div>
  );
}
