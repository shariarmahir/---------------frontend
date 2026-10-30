import { test } from "node:test";
import assert from "node:assert/strict";
import { breakdown, bucketize, change, earningOf, periodOf, total, type Order } from "./business.ts";
import { orders } from "../../data/media/orders.ts";

const today = new Date("2026-09-25T12:00:00Z");
const order = (at: string, gross: number, extra: Partial<Order> = {}): Order => ({ id: at, at, item: "কিট", source: "product", buyer: "anik", qty: 1, gross, status: "delivered", ...extra });

test("earnings keep 95%; a cancelled order counts as an order but earns nothing", () => {
  assert.equal(earningOf(order("2026-09-25T08:00:00Z", 1000)), 950);
  const { current } = bucketize([order("2026-09-25T08:00:00Z", 1000), order("2026-09-25T09:00:00Z", 500, { status: "cancelled" })], "7d", today);
  assert.deepEqual(total(current), { revenue: 1000, earnings: 950, sales: 1, orders: 2 });
});

test("days land in the right bucket, and the week before is the comparison", () => {
  const list = [order("2026-09-25T01:00:00Z", 100), order("2026-09-19T23:00:00Z", 200), order("2026-09-18T10:00:00Z", 300), order("2026-09-11T10:00:00Z", 999)];
  const { current, previous } = bucketize(list, "7d", today);
  assert.equal(current.length, 7);
  assert.equal(current[6].at, "2026-09-25");
  assert.equal(current[6].revenue, 100);
  assert.equal(current[0].at, "2026-09-19");
  assert.equal(current[0].revenue, 200);
  assert.equal(previous[6].revenue, 300, "Sept 18 is the last day of the week before");
  assert.equal(total(previous).revenue, 300, "Sept 11 is older than both weeks");
  assert.equal(periodOf("2026-09-26T01:00:00Z", "7d", today), null, "the future is in no period");
});

test("months are calendar months, the oldest first", () => {
  const { current, previous } = bucketize([order("2026-09-01T00:00:00Z", 10), order("2025-10-31T00:00:00Z", 20), order("2025-09-30T00:00:00Z", 40)], "12m", today);
  assert.equal(current[11].at, "2026-09-01");
  assert.equal(current[0].at, "2025-10-01");
  assert.equal(current[11].revenue, 10);
  assert.equal(current[0].revenue, 20);
  assert.equal(previous[11].revenue, 40);
});

test("change is a whole percent, or null with nothing to compare", () => {
  assert.equal(change(150, 100), 50);
  assert.equal(change(50, 100), -50);
  assert.equal(change(10, 0), null);
});

test("breakdown counts statuses and ranks items by revenue", () => {
  const b = breakdown([order("2026-09-25T01:00:00Z", 100, { item: "ক" }), order("2026-09-24T01:00:00Z", 900, { item: "খ", source: "service" }), order("2026-09-24T02:00:00Z", 50, { item: "ক", status: "cancelled" })], "7d", today);
  assert.deepEqual(b.status, { processing: 0, shipping: 0, delivered: 2, cancelled: 1 });
  assert.deepEqual(b.source, { product: 100, service: 900, digital: 0 });
  assert.deepEqual(b.top.map((t) => t.item), ["খ", "ক"]);
});

test("the seeded shop history is stable, ordered and fills both years", () => {
  assert.ok(orders.length > 250);
  assert.equal(new Set(orders.map((o) => o.id)).size, orders.length);
  const year = bucketize(orders, "12m", today);
  assert.ok(year.current.every((b) => b.orders > 0) && year.previous.every((b) => b.orders > 0), "no empty month");
  assert.ok(total(year.current).revenue > total(year.previous).revenue, "the shop grew");
});
