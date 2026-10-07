import type { Metadata } from "next";
import { LiveClass } from "@/components/media/academy/classroom/live-class";

export const metadata: Metadata = { title: "লাইভ ক্লাস · ক্লাসরুম" };

/** A batch's live class: the lobby, then the video room. */
export default async function LiveClassPage({ params }: { params: Promise<{ batch: string }> }) {
  return <LiveClass id={decodeURIComponent((await params).batch)} />;
}
