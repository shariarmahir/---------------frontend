import type { Metadata } from "next";
import { PanelList } from "@/components/media/academy/panel/panel-list";

export const metadata: Metadata = { title: "প্যানেল মার্কিং · একাডেমি" };

/** The teacher-examiner's finals: the ones to mark and the rubric. */
export default function PanelPage() {
  return <PanelList />;
}
