import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassroomRoom } from "@/components/media/academy/classroom/room";

export const metadata: Metadata = { title: "ক্লাসরুম · একাডেমি" };

/** One batch's classroom. */
export default async function BatchRoomPage({ params }: { params: Promise<{ batch: string }> }) {
  const id = decodeURIComponent((await params).batch);
  return (
    <Suspense fallback={null}>
      <ClassroomRoom id={id} />
    </Suspense>
  );
}
