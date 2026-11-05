import type { Metadata } from "next";
import { WatchView } from "@/components/media/academy/videos/watch-view";
import { classVideos } from "@/data/media/academy";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = decodeURIComponent((await params).id);
  return { title: `${classVideos.find((v) => v.id === id)?.title ?? "ক্লাস ভিডিও"} · একাডেমি` };
}

export default async function WatchPage({ params }: Props) {
  return <WatchView id={decodeURIComponent((await params).id)} />;
}
