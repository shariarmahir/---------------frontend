"use client";

import Link from "next/link";
import { useState } from "react";
import { Play, Video } from "lucide-react";
import { durationText, youtubeEmbed, type ClassVideo, watchHref } from "@/lib/media/academy";
import { Num, useFormat } from "../../ui/numerals";
import { AssetCard, AssetGrid, FrameImage, FrameTag, frameClass } from "../catalogue/asset-card";
import { Modal } from "../catalogue/modal";

export interface VideoEntry {
  video: ClassVideo;
  image?: string;
  teacher: string;
  academy: string;
}

/**
 * This week's free classes. "চালান" plays a class in the dialog when its
 * teacher gave a YouTube link; otherwise it opens the class's own page,
 * where the player, notes and comments are.
 */
export function VideoCards({ entries }: { entries: VideoEntry[] }) {
  const { num } = useFormat();
  const [playing, setPlaying] = useState<{ title: string; src: string } | null>(null);

  return (
    <>
      <AssetGrid count={entries.length}>
        {entries.map(({ video: v, image, teacher, academy }, i) => {
          const embed = v.href ? youtubeEmbed(v.href) : null;
          const art = (
            <>
              {image && <FrameImage src={image} alt="" />}
              <FrameTag icon={Play}>চালান</FrameTag>
            </>
          );
          return (
            <li key={v.id} className="bg-(--c-bg)">
              <AssetCard
                kind={{ icon: Video, label: "ক্লাস ভিডিও" }}
                n={i + 1}
                frame={
                  embed ? (
                    <button type="button" aria-label={`চালান: ${v.title}`} onClick={() => setPlaying({ title: v.title, src: embed })} className={frameClass}>
                      {art}
                    </button>
                  ) : (
                    <Link href={watchHref(v)} aria-label={`চালান: ${v.title}`} className={frameClass}>
                      {art}
                    </Link>
                  )
                }
                title={v.title}
                text={
                  <p>
                    {v.course} · সপ্তাহ <Num value={v.week} /> · {teacher}, {academy}
                  </p>
                }
                action={{ href: watchHref(v), label: "পুরো ক্লাস", icon: Play, aside: num(durationText(v.seconds)) }}
              />
            </li>
          );
        })}
      </AssetGrid>

      <Modal open={playing !== null} onClose={() => setPlaying(null)} label={playing?.title ?? "ক্লাস ভিডিও"} className="max-w-5xl overflow-hidden bg-black">
        {playing && (
          <div className="relative aspect-video w-full">
            <iframe src={`${playing.src}?autoplay=1`} title={playing.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="absolute inset-0 h-full w-full" />
          </div>
        )}
      </Modal>
    </>
  );
}
