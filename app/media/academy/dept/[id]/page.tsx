import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeptPage } from "@/components/media/academy/dept-page/dept-page";
import { departments, getDepartment } from "@/data/media/academy";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return departments.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dept = getDepartment((await params).id);
  return { title: dept ? `${dept.name} · একাডেমি` : "বিভাগ", description: dept?.blurb };
}

/** A department: who it suits, its courses week by week, joining, workshops, resources and stories. */
export default async function DepartmentPage({ params }: Props) {
  const dept = getDepartment((await params).id);
  if (!dept) notFound();
  return <DeptPage dept={dept} />;
}
