import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BusinessCrm, BusinessCrmFallback } from "@/components/command/business-crm";
import { BUSINESSES } from "@/data/command/consumer";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return BUSINESSES.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const business = BUSINESSES.find((b) => b.id === id);
  return { title: business ? `${business.nameBn} (${business.name})` : "Business not found" };
}

export default async function BusinessPage({ params }: Props) {
  const { id } = await params;
  if (!BUSINESSES.some((b) => b.id === id)) notFound();
  return (
    <Suspense fallback={<BusinessCrmFallback />}>
      <BusinessCrm businessId={id} />
    </Suspense>
  );
}
