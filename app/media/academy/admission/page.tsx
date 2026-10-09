import { redirect } from "next/navigation";
import { getDepartment } from "@/data/media/academy";

/**
 * The old free join form is gone: joining a department now happens at the
 * checkout, with the first course. Old links land on the department's
 * course list, or on all departments.
 */
export default async function AdmissionPage({ searchParams }: { searchParams: Promise<{ dept?: string }> }) {
  const { dept } = await searchParams;
  redirect(dept && getDepartment(dept) ? `/media/academy/dept/${dept}#join` : "/media/academy");
}
