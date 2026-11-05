import type { Metadata } from "next";
import { MapPage } from "@/components/tv-wall/pages/map";

export const metadata: Metadata = { title: "Crime map" };

export default function Page() {
  return <MapPage />;
}
