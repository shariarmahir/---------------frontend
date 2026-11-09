import { redirect } from "next/navigation";
import { getDepartment } from "@/data/media/academy";

/**
 * The old academies list, now /media/academy/academies. An old link to one
 * department's academy opens that academy's own page.
 */
export default async function AcademiesListPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const dept = getDepartment((await searchParams).d ?? "");
  redirect(dept ? `/media/academy/a/${dept.academy.id}` : "/media/academy/academies");
}
