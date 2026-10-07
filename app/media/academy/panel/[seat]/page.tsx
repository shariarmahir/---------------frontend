import type { Metadata } from "next";
import { MarkSheet } from "@/components/media/academy/panel/mark-sheet";

export const metadata: Metadata = { title: "নম্বর দিন · প্যানেল" };

export default async function MarkPage({ params }: { params: Promise<{ seat: string }> }) {
  return <MarkSheet seatId={(await params).seat} />;
}
