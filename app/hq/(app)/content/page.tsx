import type { Metadata } from "next";
import { ContentCenter } from "@/components/hq/control/content";
import { Guard } from "@/components/hq/guard";

export const metadata: Metadata = { title: "Website Content" };

export default function Page() {
  return (
    <Guard perm="content.manage">
      <ContentCenter />
    </Guard>
  );
}
