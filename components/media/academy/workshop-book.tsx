"use client";

import { useState } from "react";
import { Check, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useRequireAccount } from "@/components/auth/use-require-account";
import type { Workshop } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { actionClass } from "./catalogue/asset-card";
import { PayDialog } from "./pay-dialog";
import { updateAcademy, useAcademy } from "./use-academy";

/** Take a workshop seat — straight away when free, through escrow when paid. */
export function WorkshopBook({ workshop }: { workshop: Workshop }) {
  const ensure = useRequireAccount();
  const hydrated = useHydrated();
  const booked = useAcademy((a) => Boolean(a.workshops[workshop.id]));
  const [paying, setPaying] = useState(false);
  const full = workshop.taken >= workshop.seats;

  function confirm() {
    updateAcademy((a) => ({ ...a, workshops: { ...a.workshops, [workshop.id]: true } }));
    setPaying(false);
    toast.success("আসন রাখা হয়েছে", { description: `${workshop.place} — সময়মতো পৌঁছাবেন।` });
  }

  if (hydrated && booked) {
    return (
      <p className="flex h-9 items-center justify-center gap-1.5 border border-(--c-line) text-[13px] font-bold text-(--c-good)">
        <Check className="size-4" aria-hidden /> আসন রাখা হয়েছে
      </p>
    );
  }

  return (
    <>
      <button type="button" disabled={full} onClick={() => ensure("কর্মশালায় আসন রাখতে") && (workshop.fee === 0 ? confirm() : setPaying(true))} className={`${actionClass} disabled:cursor-not-allowed disabled:opacity-40`}>
        <Ticket className="size-4" aria-hidden />
        {full ? "আসন পূর্ণ" : "আসন রাখুন"}
      </button>
      {workshop.fee > 0 && <PayDialog open={paying} onOpenChange={setPaying} title={workshop.title} label={`কর্মশালা: ${workshop.title}`} price={workshop.fee} onPaid={confirm} />}
    </>
  );
}
