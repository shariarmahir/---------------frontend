import type { Metadata } from "next";
import { ApplyForm } from "@/components/hq/gate-apply";

export const metadata: Metadata = { title: "Apply for a member ID" };

export default function HqApplyPage() {
  return <ApplyForm />;
}
