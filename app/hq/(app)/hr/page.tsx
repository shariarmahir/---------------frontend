import type { Metadata } from "next";
import { HrCenter } from "@/components/hq/business/hr";
import { Guard } from "@/components/hq/guard";

export const metadata: Metadata = { title: "HR" };

export default function Page() {
  return (
    <Guard perm={"hr.manage"}>
      <HrCenter />
    </Guard>
  );
}
