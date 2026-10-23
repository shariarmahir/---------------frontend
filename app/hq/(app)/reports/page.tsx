import type { Metadata } from "next";
import { Reports } from "@/components/hq/business/reports";
import { Guard } from "@/components/hq/guard";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return (
    <Guard perm={"reports.view"}>
      <Reports />
    </Guard>
  );
}
