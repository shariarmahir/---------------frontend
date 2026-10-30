import type { Metadata } from "next";
import { Attendance } from "@/components/hq/time/attendance";

export const metadata: Metadata = { title: "Attendance & Leave" };

export default function Page() {
  return (
    <Attendance />
  );
}
