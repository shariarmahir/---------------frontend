/** Money maths for Kandari HQ's finance pages. Pure; tested in finance.test.ts. */
import { addDays, dhakaDay } from "./rules.ts";
import type { Day, Doc, Txn } from "./types.ts";

export type Period = "week" | "month" | "half" | "year";
export const PERIOD_LABEL: Record<Period, string> = { week: "Week", month: "Month", half: "6 months", year: "1 year" };

/** The span of days a period covers, ending today. */
export function periodRange(period: Period, now: number): { from: Day; to: Day } {
  const to = dhakaDay(now);
  const back = { week: 6, month: 29, half: 182, year: 364 }[period];
  return { from: addDays(to, -back), to };
}

export function inRange(t: Pick<Txn, "day">, from: Day, to: Day): boolean {
  return t.day >= from && t.day <= to;
}

export function totals(txns: Txn[]): { income: number; expense: number; profit: number; roi: number | null } {
  let income = 0;
  let expense = 0;
  for (const t of txns) {
    if (t.kind === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, profit: income - expense, roi: expense > 0 ? (income - expense) / expense : null };
}

/** Income, expense and profit per calendar month ("2026-10"), oldest first, the last `months` months. */
export function monthly(txns: Txn[], now: number, months: number): { month: string; income: number; expense: number; profit: number }[] {
  const end = dhakaDay(now).slice(0, 7);
  const [y, m] = end.split("-").map(Number);
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const rows = new Map(keys.map((k) => [k, { month: k, income: 0, expense: 0, profit: 0 }]));
  for (const t of txns) {
    const r = rows.get(t.day.slice(0, 7));
    if (!r) continue;
    if (t.kind === "income") r.income += t.amount;
    else r.expense += t.amount;
  }
  for (const r of rows.values()) r.profit = r.income - r.expense;
  return [...rows.values()];
}

/** Totals by a key (category, client…), largest first. */
export function groupBy(txns: Txn[], key: (t: Txn) => string): { key: string; amount: number }[] {
  const m = new Map<string, number>();
  for (const t of txns) m.set(key(t), (m.get(key(t)) ?? 0) + t.amount);
  return [...m.entries()].map(([k, amount]) => ({ key: k, amount })).sort((a, b) => b.amount - a.amount);
}

/** Cash on hand: every income minus every expense. */
export function balance(txns: Txn[]): number {
  return txns.reduce((s, t) => s + (t.kind === "income" ? t.amount : -t.amount), 0);
}

export function docTotals(d: Pick<Doc, "lines" | "vatPct">): { subtotal: number; vat: number; total: number } {
  const subtotal = d.lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const vat = Math.round((subtotal * d.vatPct) / 100);
  return { subtotal, vat, total: subtotal + vat };
}

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function under100(n: number): string {
  return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? `-${ONES[n % 10]}` : ""}`;
}
function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? `${ONES[h]} hundred` : "", r ? under100(r) : ""].filter(Boolean).join(" ");
}
/** Taka in words, Bangladeshi style (crore, lakh, thousand): "Taka one lakh twenty thousand only". */
export function takaInWords(amount: number): string {
  let n = Math.round(Math.abs(amount));
  if (n === 0) return "Taka zero only";
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7);
  n %= 1e7;
  const lakh = Math.floor(n / 1e5);
  n %= 1e5;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (crore) parts.push(`${crore >= 1000 ? takaInWords(crore).replace(/^Taka | only$/g, "") : under1000(crore)} crore`);
  if (lakh) parts.push(`${under100(lakh)} lakh`);
  if (thousand) parts.push(`${under100(thousand)} thousand`);
  if (n) parts.push(under1000(n));
  return `Taka ${parts.join(" ")} only`;
}

export function txnCsv(t: Txn, clientName = ""): Record<string, string | number> {
  return { date: t.day, type: t.kind, category: t.category, amount: t.amount, client: clientName, method: t.method, note: t.note };
}
