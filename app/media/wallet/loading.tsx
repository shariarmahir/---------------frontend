import { WalletSkeleton } from "@/components/media/ui/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl">
      <WalletSkeleton />
    </div>
  );
}
