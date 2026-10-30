import type { Metadata } from "next";
import { Finance } from "@/components/hq/business/finance";
import { Guard } from "@/components/hq/guard";

export const metadata: Metadata = { title: "Finance" };

export default function Page() {
  return (
    <Guard perm={"finance.view"}>
      <Finance />
    </Guard>
  );
}
