"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useRequireAccount } from "@/components/auth/use-require-account";
import { getCourse } from "@/data/media/academy";
import type { Course } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Num, useFormat } from "../ui/numerals";
import { defaultBatch, useCourseBatches } from "./classroom/use-batches";
import { updateAcademy, useAcademy } from "./use-academy";

const EMPTY: string[] = [];

/** The course codes waiting at checkout that still exist and are not joined yet. */
export function useCart(): string[] {
  const cart = useAcademy((a) => a.cart ?? EMPTY);
  const enrolled = useAcademy((a) => a.enrolled);
  return cart.filter((id) => getCourse(id) && !enrolled[id]);
}

export function addToCart(id: string) {
  updateAcademy((a) => ((a.cart ?? []).includes(id) ? a : { ...a, cart: [...(a.cart ?? []), id] }));
}

export function removeFromCart(id: string) {
  updateAcademy((a) => ({ ...a, cart: (a.cart ?? []).filter((x) => x !== id) }));
}

export function clearCart(ids: string[]) {
  updateAcademy((a) => ({ ...a, cart: (a.cart ?? []).filter((x) => !ids.includes(x)) }));
}

/**
 * "ভর্তি হোন" for one course: into the cart and on to the checkout, the one
 * form that enrols — free or paid. Once enrolled, a link back to the course.
 */
export function CheckoutButton({ course, className }: { course: Course; className?: string }) {
  const hydrated = useHydrated();
  const ensure = useRequireAccount();
  const router = useRouter();
  const enrolled = useAcademy((a) => a.enrolled[course.id]);
  const full = !defaultBatch(useCourseBatches(course.id));
  if (hydrated && enrolled)
    return (
      <Link href={`/media/academy/classroom/${encodeURIComponent(enrolled.batch ?? course.id)}`} className={mediaButton({ variant: "green", size: "sm", className })}>
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
      className={mediaButton({ size: "sm", className })}
    >
      {full ? "আসন পূর্ণ" : "ভর্তি হোন"}
    </button>
  );
}

/** The bar's cart: a round button to checkout, with the count on its shoulder. */
export function CartButton({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const { num } = useFormat();
  const cart = useCart();
  const n = hydrated ? cart.length : 0;
  return (
    <Link
      href="/media/academy/checkout"
      className={cn("relative grid size-10 shrink-0 place-items-center rounded-full text-m-ink/85 transition-colors hover:bg-m-ink/6 hover:text-m-ink", className)}
      aria-label={n > 0 ? `কার্ট — ${num(n)}টি কোর্স` : "কার্ট"}
    >
      <ShoppingCart className="size-5" aria-hidden />
      {n > 0 && (
        <span className="live-in absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-m-blue px-1 text-[11px] leading-5 font-bold text-m-on ring-2 ring-white" aria-hidden>
          <Num value={n} />
        </span>
      )}
    </Link>
  );
}
