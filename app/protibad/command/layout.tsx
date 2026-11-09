import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CommandShell } from "@/components/command/shell";

export const metadata: Metadata = {
  title: { default: "Command Dashboard | প্রতিবাদ — কাণ্ডারী-ল্যাব", template: "%s | প্রতিবাদ Command — কাণ্ডারী-ল্যাব" },
  description:
    "A live demo of the প্রতিবাদ command dashboard: sample complaints routed to the nearest police unit or the ভোক্তা অধিদপ্তর, escalated when nobody answers, and worked as tasks until closed.",
};

/**
 * The প্রতিবাদ command dashboard (/protibad/command): its own frame, no site
 * header or footer. Every case in it is demo data simulated in the browser.
 */
export default function CommandLayout({ children }: { children: ReactNode }) {
  return <CommandShell>{children}</CommandShell>;
}
