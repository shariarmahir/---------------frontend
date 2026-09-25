import { test } from "node:test";
import assert from "node:assert/strict";
import { categories } from "./categories.ts";
import { threads } from "./chat.ts";
import { listings } from "./market.ts";
import { posts } from "./posts.ts";
import { people } from "./users.ts";
import { walletSeed } from "./wallet.ts";

const byHandle = new Map(people.map((p) => [p.handle, p]));
const categoryIds = new Set(categories.map((c) => c.id));

function unique(ids: string[], what: string) {
  assert.equal(new Set(ids).size, ids.length, `duplicate ${what} id`);
}

test("ids are unique", () => {
  unique(people.map((p) => p.handle), "person");
  unique(posts.map((p) => p.id), "post");
  unique(listings.map((l) => l.id), "listing");
  unique(threads.map((t) => t.id), "thread");
  unique(walletSeed.txns.map((t) => t.id), "txn");
});

test("categories have sane bands", () => {
  for (const c of categories) assert.ok(c.band.low < c.band.high && c.skills.length > 0, c.id);
});

test("every referenced person exists", () => {
  const refs = [
    ...posts.flatMap((p) => [p.author, ...p.comments.flatMap((c) => [c.author, ...(c.replies ?? []).map((r) => r.author)])]),
    ...listings.map((l) => l.seller),
    ...threads.flatMap((t) => [t.with, ...t.messages.map((m) => m.from)]),
  ];
  for (const h of refs) assert.ok(byHandle.has(h), `unknown handle ${h}`);
});

test("posts and listings tie to real skills", () => {
  for (const p of posts) {
    assert.ok(categoryIds.has(p.category), p.id);
    assert.ok(p.media.length > 0, `${p.id} needs media`);
    const author = byHandle.get(p.author)!;
    assert.ok(author.skills.some((s) => s.skill === p.skill.name), `${p.id}: ${p.author} lacks ${p.skill.name}`);
    if (p.listingId) {
      const l = listings.find((x) => x.id === p.listingId);
      assert.ok(l, `${p.id} → ${p.listingId}`);
      assert.equal(l!.seller, p.author, `${p.id} listing seller`);
    }
  }
  for (const l of listings) {
    const seller = byHandle.get(l.seller)!;
    assert.ok(seller.skills.some((s) => s.skill === l.skill), `${l.id}: ${l.seller} lacks ${l.skill}`);
    assert.ok(l.floor <= l.price, `${l.id} floor`);
    if (!l.negotiable) assert.equal(l.floor, l.price, `${l.id} fixed price floor`);
  }
});

test("threads match their listings", () => {
  for (const t of threads) {
    if (!t.listingId) continue;
    const l = listings.find((x) => x.id === t.listingId);
    assert.ok(l, t.id);
    assert.equal(t.ask, l!.price, `${t.id} ask`);
    assert.equal(t.floor, l!.floor, `${t.id} floor`);
    assert.equal(t.with, l!.seller, `${t.id} seller`);
  }
});

test("wallet rows disclose fees correctly", () => {
  for (const t of walletSeed.txns) {
    if (t.feeSide === "seller") assert.equal(t.net, t.gross - t.fee, t.id);
    if (t.feeSide === "buyer") assert.equal(Math.abs(t.net), t.gross + t.fee, t.id);
    if (t.feeSide === "none") assert.equal(t.fee, 0, t.id);
    if (t.fee > 0) assert.equal(t.fee, Math.round(t.gross * 0.05), `${t.id} is 5%`);
  }
});
