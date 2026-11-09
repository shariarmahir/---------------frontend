import { VIDEOS } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, BAND_Y, COLUMN, SectionHead } from "./kit";
import { VideoPlayer } from "./video-player";

/** Videos: Bangladesh on film, a full screen of its own on the dark band, in a narrower column so the stage reads as a cinema screen. */
export function Videos() {
  return (
    <section id="videos" aria-labelledby="videos-title" className={cn(ANCHOR, BAND_Y, "flex min-h-svh flex-col justify-center bg-ml-ink text-white")}>
      <div className={cn(COLUMN, "flex max-w-6xl flex-col gap-10 lg:gap-12")}>
        <SectionHead id="videos-title" tone="dark" title={VIDEOS.title} lede={VIDEOS.lede} cta={VIDEOS.cta} />
        <VideoPlayer films={VIDEOS.films} />
      </div>
    </section>
  );
}
