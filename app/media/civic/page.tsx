import type { Metadata } from "next";
import { CitizenHub } from "@/components/media/citizen/hub";

export const metadata: Metadata = { title: "নাগরিক বার্তা" };

export default function CivicPage() {
  return <CitizenHub />;
}
