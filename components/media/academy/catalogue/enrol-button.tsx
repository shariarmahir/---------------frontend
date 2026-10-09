"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoorOpen, Ticket } from "lucide-react";
import { useRequireAccount } from "@/components/auth/use-require-account";
import type { Course } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { addToCart } from "../cart";
import { defaultBatch, useCourseBatches } from "../classroom/use-batches";
import { useAcademy } from "../use-academy";
import { primaryBtn, secondaryBtn } from "./buttons";

/**
 * "ভর্তি হোন" in the catalogue's dress: into the cart and on to the one
 * admission form. Once enrolled it is the way to the classroom; with no
 * batch left to join, it says the seats are gone.
 */
export function EnrolButton({ course, className }: { course: Course; className?: string }) {
  const hydrated = useHydrated();
  const ensure = useRequireAccount();
  const router = useRouter();
  const enrolled = useAcademy((a) => a.enrolled[course.id]);
  const full = !defaultBatch(useCourseBatches(course.id));

  if (hydrated && enrolled)
    return (
      <Link href={`/media/academy/classroom/${encodeURIComponent(enrolled.batch ?? course.id)}`} className={cn(secondaryBtn, className)}>
        <DoorOpen className="size-4" aria-hidden />
        ক্লাসরুমে যান
      </Link>
    );
  return (
    <button
      type="button"
      disabled={full}
      onClick={() => {
        if (!ensure("কোর্সে ভর্তি হতে")) return;
        addToCart(course.id);
        router.push(`/media/academy/checkout?course=${encodeURIComponent(course.id)}`);
      }}
      className={cn(primaryBtn, className)}
    >
      <Ticket className="size-4" aria-hidden />
      {full ? "আসন পূর্ণ" : "ভর্তি হোন"}
    </button>
  );
}
