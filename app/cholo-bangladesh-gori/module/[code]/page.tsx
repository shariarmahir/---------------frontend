import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModuleDetail } from "@/components/gori/module/module-detail";
import { moduleOf, modules, type ModuleCode } from "@/data/gori/modules";

export function generateStaticParams() {
  return modules.map((m) => ({ code: m.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const m = moduleOf(code);
  return { title: m ? `${m.code} ${m.titleBn} — চলো বাংলাদেশ গড়ি` : "মডিউল পাওয়া যায়নি" };
}

export default async function ModulePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!moduleOf(code)) notFound();
  return <ModuleDetail code={code as ModuleCode} />;
}
