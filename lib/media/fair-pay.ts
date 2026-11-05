/**
 * Fair pay for job posts. Every job states its pay, and pay below the floor
 * is refused — cheap labour is against the platform's rules.
 *
 *   month — no less than the 2023 garment-sector minimum wage (৳12,500)
 *   hour  — ৳150, roughly that wage over a 48-hour week plus overhead
 *   task  — three-quarters of the category's fair band, as for offers
 *
 * Floors are editorial defaults for the demo; revisit with labour data.
 */
import type { PriceBand } from "./fair-price.ts";

export type PayUnit = "month" | "hour" | "task";

export const PAY_FLOOR = { month: 12500, hour: 150 } as const;

export const payUnitBn: Record<PayUnit, string> = { month: "প্রতি মাস", hour: "প্রতি ঘণ্টা", task: "প্রতি কাজ" };

export function fairPayFloor(unit: PayUnit, band: PriceBand): number {
  if (unit === "task") return Math.round(band.low * 0.75);
  return PAY_FLOOR[unit];
}

export function isFairPay(amount: number, unit: PayUnit, band: PriceBand): boolean {
  return amount >= fairPayFloor(unit, band);
}
