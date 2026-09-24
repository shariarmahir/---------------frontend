import Image from "next/image";
import type { Photo } from "@/data/bangladesh";
import { cn } from "@/lib/utils";

/**
 * A photograph with its credit attached.
 *
 * Commons photos are CC BY / CC BY-SA, which require attribution next to
 * the work, not only in a list at the end — so the credit rides on the
 * image, quiet until hovered. Kandari's own assets carry no credit.
 */
export function StoryPhoto({
  photo,
  sizes,
  className,
  imgClassName,
  priority,
  drift,
  hideCredit,
}: {
  /** Set when the photo sits inside another control (a button or link):
   *  a link can't nest there, so the caller shows the credit outside. */
  hideCredit?: boolean;
  photo: Photo;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Slow Ken Burns drift — for large, calm photographs only. */
  drift?: boolean;
}) {
  return (
    <div className={cn("group/photo relative overflow-hidden", className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={85}
        style={photo.focus ? { objectPosition: photo.focus } : undefined}
        className={cn(
          "object-cover transition-transform duration-700 ease-out group-hover/photo:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100",
          drift && "story-drift group-hover/photo:paused",
          imgClassName,
        )}
      />
      {photo.credit && !hideCredit && (
        <a
          href={photo.credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 bottom-2 z-10 max-w-[80%] truncate rounded-md bg-slate-950/55 px-1.5 py-0.5 font-mono text-[9px] text-white/80 opacity-70 backdrop-blur-sm transition-opacity group-hover/photo:opacity-100 hover:underline focus-visible:opacity-100"
          title={`${photo.credit.author} — ${photo.credit.license}`}
        >
          © {photo.credit.author} · {photo.credit.license}
          <span className="sr-only"> (photo source, opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}
