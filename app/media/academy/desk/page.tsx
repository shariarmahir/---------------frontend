import type { Metadata } from "next";
import { DeskHome } from "@/components/media/academy/desk/desk-home";

export const metadata: Metadata = { title: "শিক্ষক ডেস্ক · একাডেমি" };

export default function DeskPage() {
  return <DeskHome />;
}
