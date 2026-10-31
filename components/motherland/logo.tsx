import { cn } from "@/lib/utils";

/**
 * The MOTHERLAND wordmark, stacked like the reference site's: the country
 * in small letters over the name, whose O is the flag's red sun. It takes
 * the colour of the text around it, so it holds over the film and on paper.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span role="img" aria-label="MOTHERLAND, Bangladesh" className={cn("inline-flex flex-col font-ml-sans leading-none select-none", className)}>
      <span aria-hidden className="text-[0.7em] font-bold tracking-[0.28em]">
        BANGLADESH
      </span>
      <span aria-hidden className="text-[1.7em] font-black tracking-[-0.03em]">
        M
        <span className="mx-[0.04em] inline-block size-[0.7em] translate-y-[0.02em] rounded-full bg-ml-red align-baseline" />
        THERLAND
      </span>
    </span>
  );
}
