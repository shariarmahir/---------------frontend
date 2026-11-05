import type { Metadata } from "next";
import { Suspense } from "react";
import { Guard } from "@/components/hq/guard";
import { AccessControl } from "@/components/hq/admin/access";

export const metadata: Metadata = { title: "Access Control" };

export default function Page() {
  return (
    <Suspense>
      <Guard perm={"prime"}>
      <AccessControl />
    </Guard>
    </Suspense>
  );
}
