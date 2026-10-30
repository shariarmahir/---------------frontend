import { test } from "node:test";
import assert from "node:assert/strict";
import { toBijoy } from "./bijoy.ts";

test("the classroom slogans turn into Bijoy key codes", () => {
  assert.equal(toBijoy("চল্ চল্ চল্। চল্ চল্ চল্। ঊর্ধ্ব গগনে বাজে মাদল"), "Pj& Pj& Pj&| Pj& Pj& Pj&| EaŸ© MM‡b ev‡R gv`j");
  assert.equal(toBijoy("কাগজ এগিয়ে রাখো বন্ধু"), "KvMR GwM‡q iv‡Lv eÜy");
  assert.equal(toBijoy("কাজ জমালে জ্বিনে ধরবে"), "KvR Rgv‡j wR¡‡b ai‡e");
  assert.equal(toBijoy("কষ্ট না করলে কেষ্ট মেলে না।"), "Kó bv Ki‡j ‡Kó ‡g‡j bv|");
  assert.equal(toBijoy("একবার না পারিলে দেখ শতবার।"), "GKevi bv cvwi‡j ‡`L kZevi|");
  assert.equal(toBijoy("সময় গেলে সাধন হবে না"), "mgq ‡M‡j mvab n‡e bv");
});

test("য় typed as য + nukta reads the same as the single letter", () => {
  assert.equal(toBijoy("সময়"), "mgq");
  assert.equal(toBijoy("বড়"), "eo");
});

test("kars wrap the whole conjunct, reph sits after it, unknown pairs keep a hasant", () => {
  assert.equal(toBijoy("কোষ্ঠ"), "‡Kvô");
  assert.equal(toBijoy("উজ্জ্বল"), "D¾&ej");
  assert.equal(toBijoy("দক্ষিণ"), "`wÿY");
  assert.equal(toBijoy("কার্য"), "Kvh©");
  assert.equal(toBijoy("ব্যাগ"), "e¨vM");
});

test("names convert only when every letter has a checked form", async () => {
  const { toBijoyStrict } = await import("./bijoy.ts");
  assert.equal(toBijoyStrict("মাহির শারিয়ার মাহিন"), "gvwni kvwiqvi gvwnb");
  assert.equal(toBijoyStrict("তানিয়া আক্তার"), "Zvwbqv Av³vi");
  assert.equal(toBijoyStrict("শ্রাবন্তী"), "kªve šÍx".replace(" ", ""));
  assert.equal(toBijoyStrict("প্রিয়া"), "wcÖqv");
  // English letters would be drawn as Bangla by the display face.
  assert.equal(toBijoyStrict("Mahir"), null);
  // A conjunct nobody has checked stays in the Unicode face.
  assert.equal(toBijoyStrict("উজ্জ্বল"), null);
});
