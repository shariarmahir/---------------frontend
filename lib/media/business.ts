/**
 * Seller numbers for the dashboard: revenue (what buyers paid for the item),
 * earnings (revenue less the 5% seller fee), sales (units) and orders,
 * bucketed by day or month and compared with the period before. Pure,
 * tested in business.test.ts.
 */

export type OrderStatus = "processing" | "shipping" | "delivered" | "cancelled";
export type OrderSource = "product" | "service" | "digital";

export interface Order {
  id: string;
  /** ISO date-time the order was placed. */
  at: string;
  item: string;
  source: OrderSource;
  buyer: string;
  qty: number;
  /** Price of the order before fees; the buyer's 5% charge is not seller revenue. */
  gross: number;
  status: OrderStatus;
}

export type Range = "7d" | "30d" | "12m";
export type Metric = "revenue" | "earnings" | "sales" | "orders";

export interface Bucket {
  /** ISO date of the bucket's first day. */
  at: string;
  revenue: number;
  earnings: number;
  sales: number;
  orders: number;
}

export const SELLER_FEE = 0.05;

/** What the seller keeps from one order; a cancelled order earns nothing. */
export const earningOf = (o: Order) => (o.status === "cancelled" ? 0 : Math.round(o.gross * (1 - SELLER_FEE)));

const DAY = 86_400_000;
const dayIndex = (iso: string | Date) => Math.floor(new Date(iso).getTime() / DAY);
const monthIndex = (d: Date) => d.getUTCFullYear() * 12 + d.getUTCMonth();
const isoDay = (i: number) => new Date(i * DAY).toISOString().slice(0, 10);

/** 0 = this period, 1 = the one before, null = older or in the future. */
export function periodOf(at: string, range: Range, today: Date): 0 | 1 | null {
  if (range === "12m") {
    const back = monthIndex(today) - monthIndex(new Date(at));
    return back < 0 ? null : back < 12 ? 0 : back < 24 ? 1 : null;
  }
  const n = range === "7d" ? 7 : 30;
  const back = dayIndex(today) - dayIndex(at);
  return back < 0 ? null : back < n ? 0 : back < 2 * n ? 1 : null;
}

function add(b: Bucket, o: Order) {
  b.orders += 1;
  if (o.status === "cancelled") return;
  b.revenue += o.gross;
  b.earnings += earningOf(o);
  b.sales += o.qty;
}

/** This period's buckets, oldest first, and the previous period's, aligned. */
export function bucketize(orders: Order[], range: Range, today: Date): { current: Bucket[]; previous: Bucket[] } {
  const empty = (at: string): Bucket => ({ at, revenue: 0, earnings: 0, sales: 0, orders: 0 });
  if (range === "12m") {
    const tm = monthIndex(today);
    const month = (back: number) => {
      const m = tm - back;
      return `${Math.floor(m / 12)}-${String((m % 12) + 1).padStart(2, "0")}-01`;
    };
    const current = Array.from({ length: 12 }, (_, i) => empty(month(11 - i)));
    const previous = Array.from({ length: 12 }, (_, i) => empty(month(23 - i)));
    for (const o of orders) {
      const back = tm - monthIndex(new Date(o.at));
      if (back >= 0 && back < 12) add(current[11 - back], o);
      else if (back >= 12 && back < 24) add(previous[23 - back], o);
    }
    return { current, previous };
  }
  const n = range === "7d" ? 7 : 30;
  const td = dayIndex(today);
  const current = Array.from({ length: n }, (_, i) => empty(isoDay(td - (n - 1 - i))));
  const previous = Array.from({ length: n }, (_, i) => empty(isoDay(td - (2 * n - 1 - i))));
  for (const o of orders) {
    const back = td - dayIndex(o.at);
    if (back >= 0 && back < n) add(current[n - 1 - back], o);
    else if (back >= n && back < 2 * n) add(previous[2 * n - 1 - back], o);
  }
  return { current, previous };
}

export function total(buckets: Bucket[]): Omit<Bucket, "at"> {
  return buckets.reduce((t, b) => ({ revenue: t.revenue + b.revenue, earnings: t.earnings + b.earnings, sales: t.sales + b.sales, orders: t.orders + b.orders }), { revenue: 0, earnings: 0, sales: 0, orders: 0 });
}

/** Percent change, or null when there is nothing to compare with. */
export function change(now: number, before: number): number | null {
  return before === 0 ? null : Math.round(((now - before) / before) * 100);
}

/** Orders by status, revenue by source and the best sellers in one period. */
export function breakdown(orders: Order[], range: Range, today: Date) {
  const inside = orders.filter((o) => periodOf(o.at, range, today) === 0);
  const status: Record<OrderStatus, number> = { processing: 0, shipping: 0, delivered: 0, cancelled: 0 };
  const source: Record<OrderSource, number> = { product: 0, service: 0, digital: 0 };
  const items = new Map<string, { item: string; source: OrderSource; units: number; revenue: number }>();
  for (const o of inside) {
    status[o.status] += 1;
    if (o.status === "cancelled") continue;
    source[o.source] += o.gross;
    const row = items.get(o.item) ?? { item: o.item, source: o.source, units: 0, revenue: 0 };
    row.units += o.qty;
    row.revenue += o.gross;
    items.set(o.item, row);
  }
  const top = [...items.values()].sort((a, b) => b.revenue - a.revenue);
  return { status, source, top, count: inside.length };
}
