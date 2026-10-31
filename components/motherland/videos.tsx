import { VIDEOS } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, COLUMN, SectionHead } from "./kit";
import { VideoPlayer } from "./video-player";

/** Videos: Bangladesh on film, on the dark band so the pictures carry the colour. */
export function Videos() {
  return (
    <section id="videos" aria-labelledby="videos-title" className={cn(ANCHOR, "bg-ml-ink py-24 text-white sm:py-32")}>
      <div className={cn(COLUMN, "flex flex-col gap-12 lg:gap-16")}>
        <SectionHead id="videos-title" tone="dark" title={VIDEOS.title} lede={VIDEOS.lede} cta={VIDEOS.cta} />
        <VideoPlayer films={VIDEOS.films} />
      </div>
    </section>
  );
}
