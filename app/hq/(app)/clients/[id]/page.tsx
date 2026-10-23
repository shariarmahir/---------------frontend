import type { Metadata } from "next";
import { ClientPage } from "@/components/hq/business/clients";
import { Guard } from "@/components/hq/guard";

export const metadata: Metadata = { title: "Client" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Guard perm={["clients.view", "hr.manage", "finance.view"]}>
      <ClientPage id={id} />
    </Guard>
  );
}
