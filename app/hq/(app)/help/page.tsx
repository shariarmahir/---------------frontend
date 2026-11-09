import type { Metadata } from "next";
import { Suspense } from "react";
import { HelpCenter } from "@/components/hq/tasks/help";

export const metadata: Metadata = { title: "Help Requests" };

export default function Page() {
  return (
    <Suspense>
      <HelpCenter />
    </Suspense>
  );
}
