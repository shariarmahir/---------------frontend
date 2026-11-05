import { cn } from "@/lib/utils";

/** shadcn/ui Skeleton with a soft shimmer (static under reduced motion). */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden className={cn("skeleton-shimmer rounded-lg bg-slate-200/80", className)} {...props} />;
}

export { Skeleton };
