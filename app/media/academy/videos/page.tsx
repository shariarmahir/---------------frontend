import type { Metadata } from "next";
import { Suspense } from "react";
import { VideoFeed } from "@/components/media/academy/videos/video-feed";

export const metadata: Metadata = {
  title: "ক্লাস ভিডিও · একাডেমি",
  description: "প্রত্যেক শিক্ষকের প্রতি সপ্তাহের বিনামূল্যের ক্লাস, আর কোর্সে ভর্তিদের জন্য সব সপ্তাহের ভিডিও।",
};

export default function VideosPage() {
  return (
    <Suspense>
      <VideoFeed />
    </Suspense>
  );
}
