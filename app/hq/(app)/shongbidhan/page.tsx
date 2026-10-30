import type { Metadata } from "next";
import { Shongbidhan } from "@/components/hq/control/shongbidhan";

export const metadata: Metadata = { title: "Kandari Shongbidhan" };

export default function Page() {
  return <Shongbidhan />;
}
