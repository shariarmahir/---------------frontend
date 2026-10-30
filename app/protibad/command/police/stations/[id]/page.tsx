import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StationCrm, StationCrmFallback } from "@/components/command/station-crm";
import { STATIONS } from "@/data/command/stations";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return STATIONS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const station = STATIONS.find((s) => s.id === id);
  return { title: station ? station.name : "Station not found" };
}

export default async function StationPage({ params }: Props) {
  const { id } = await params;
  if (!STATIONS.some((s) => s.id === id)) notFound();
  return (
    <Suspense fallback={<StationCrmFallback />}>
      <StationCrm stationId={id} />
    </Suspense>
  );
}
