import type { Metadata } from "next";
import { Guard } from "@/components/hq/guard";
import { SecurityLog } from "@/components/hq/admin/settings";

export const metadata: Metadata = { title: "Security Log" };

export default function Page() {
  return (
    <Guard perm={"audit.view"}>
      <SecurityLog />
    </Guard>
  );
}
