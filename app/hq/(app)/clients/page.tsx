import type { Metadata } from "next";
import { ClientsBoard } from "@/components/hq/business/clients";
import { Guard } from "@/components/hq/guard";

export const metadata: Metadata = { title: "Client CRM" };

export default function Page() {
  return (
    <Guard perm={"clients.view"}>
      <ClientsBoard />
    </Guard>
  );
}
