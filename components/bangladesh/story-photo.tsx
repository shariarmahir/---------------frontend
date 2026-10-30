import Image from "next/image";
import { LINK } from "@/components/bangladesh-landing/kit";
import { Icon } from "@/components/ui/icon";
import type { Photo } from "@/data/bangladesh";
import { cn } from "@/lib/utils";

/**
 * A photograph with its credit attached.
 *
 * Commons photos are CC BY / CC BY-SA, which require attribution next to
 * the work, not only in a list at the end, so the credit rides on the
 * image unless the caller sets it beside the photo with PhotoCredit.
 * Kandari's own assets carry no credit.
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
  /** Set when the caller shows the credit itself (PhotoCredit), or when
   *  the photo sits inside a button or link, where a link can't nest. */
  hideCredit?: boolean;
  photo: Photo;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Slow Ken Burns drift, for large, calm photographs only. */
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
        style={photo.focus ? { objectPosition: photo.focus } : undefined}
        className={cn(
          "object-cover transition-transform duration-700 ease-out group-hover/photo:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100",
          drift && "story-drift group-hover/photo:paused",
          imgClassName,
        )}
      />
      {photo.credit && !hideCredit && (
        <a
          href={photo.credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 bottom-2 z-10 max-w-[80%] truncate rounded-md bg-black/75 px-2 py-0.5 text-xs text-white/80 transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
          title={`${photo.credit.author}, ${photo.credit.license}`}
        >
          © {photo.credit.author} · {photo.credit.license}
          <span className="sr-only"> (photo source, opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

/** A Commons photo's credit as a line of small print: author, licence and source, as the licence asks. */
export function PhotoCredit({ photo, className }: { photo: Photo; className?: string }) {
  if (!photo.credit) return null;
  const { author, license, licenseUrl, sourceUrl } = photo.credit;
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-relaxed text-white/80", className)}>
      <Icon name="photo_camera" className="text-sm! text-signal-orange" />
      <span>Photo: {author}</span>
      <span aria-hidden>·</span>
      {licenseUrl ? (
        <a href={licenseUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
          {license}
        </a>
      ) : (
        <span>{license}</span>
      )}
      <span aria-hidden>·</span>
      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={LINK}>
        Wikimedia Commons<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}
