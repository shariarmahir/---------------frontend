import type { Metadata } from "next";
import { Directory } from "@/components/hq/admin/people";

export const metadata: Metadata = { title: "People" };

export default function Page() {
  return (
    <Directory />
  );
}
