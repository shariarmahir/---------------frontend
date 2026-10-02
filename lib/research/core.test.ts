import { test } from "node:test";
import assert from "node:assert/strict";
import {
  blocks, buildArticle, citation, citeParts, contents, counts, draftProblems, engagementOf, feedIntent, featured, initials, nameList, paragraphs, parseReferences, pointsOf, POINTS, readMinutes, recentChanges, related, rotate, search, shareLinks, slugify, thread, topFields, topResearchers, trending, uniqueSlug, waterfall, type Article, type Draft, type TalkNote,
} from "./core.ts";

const art = (x: Partial<Article>): Article => ({
  slug: "a",
  title: "নিবন্ধ",
  kind: "paper",
  field: "health",
  level: "undergrad",
  status: "published",
  authors: [{ name: "রিয়া" }],
  institution: "ঢাকা বিশ্ববিদ্যালয়",
  year: 2025,
  published: "2025-05-01",
  summary: "সারাংশ",
  keywords: [],
  sections: [],
  references: [],
  revisions: [],
  ...x,
});

const draft = (x: Partial<Draft> = {}): Draft => ({
  title: "স্মার্টফোনে আর্সেনিক মাপার কিট",
  titleEn: "",
  kind: "innovation",
  field: "health",
  level: "undergrad",
  authors: "রিয়া দাস, তানভীর হক",
  institution: "রাজশাহী বিশ্ববিদ্যালয়",
  supervisor: "",
  year: "২০২৫",
  district: "রাজশাহী",
  summary: "নলকূপের পানিতে আর্সেনিক মাপতে ল্যাবে নমুনা পাঠাতে সপ্তাহ লাগে। আমরা স্মার্টফোনের ক্যামেরা দিয়ে রঙ মিলিয়ে দশ মিনিটে মাপার একটা উপায় পরীক্ষা করেছি।",
  keywords: "আর্সেনিক, পানি, স্মার্টফোন",
  sections: [
    { heading: "পদ্ধতি", body: "রঙ-বদলানো কাগজ, একটা আলো-বাক্স আর ফোনের ক্যামেরা দিয়ে ছবি তুলে রঙের মান মেলানো হয়েছে।" },
    { heading: "ফলাফল", body: "৬০টি নমুনার মধ্যে ৫১টিতে ল্যাবের ফলের সাথে একই শ্রেণিতে পড়েছে; বাকিগুলো সীমার কাছাকাছি।" },
    { heading: "", body: "" },
  ],
  references: "WHO Guidelines for drinking-water quality, 4th ed. https://www.who.int/publications/i/item/9789241549950\nবিবিএস জনশুমারি ২০২২",
  agree: true,
  ...x,
});

test("slugs keep Bangla, join words with dashes, turn Bangla digits Latin, and never come out empty", () => {
  assert.equal(slugify("স্মার্টফোনে আর্সেনিক মাপার কিট"), "স্মার্টফোনে-আর্সেনিক-মাপার-কিট");
  assert.equal(slugify("  Low-cost Flood Sensor (v2)!  "), "low-cost-flood-sensor-v2");
  assert.equal(slugify("২০২৫ সালের জরিপ"), "2025-সালের-জরিপ");
  assert.equal(slugify("!!!"), "nibondho");
  assert.ok(slugify("ক ".repeat(100)).length <= 80);
  assert.equal(uniqueSlug("a", new Set(["a", "a-2"])), "a-3");
  assert.equal(uniqueSlug("b", new Set(["a"])), "b");
});

test("paragraphs split on blank lines; citation marks come apart from the text", () => {
  assert.deepEqual(paragraphs("এক\n\n  দুই \n \n"), ["এক", "দুই"]);
  assert.deepEqual(citeParts("পানি নিরাপদ নয়[1], বলছে জরিপ[12]।"), [{ text: "পানি নিরাপদ নয়" }, { cite: 1 }, { text: ", বলছে জরিপ" }, { cite: 12 }, { text: "।" }]);
  assert.deepEqual(citeParts("কোনো সূত্র নেই"), [{ text: "কোনো সূত্র নেই" }]);
  assert.deepEqual(citeParts("জরিপ[২]"), [{ text: "জরিপ" }, { cite: 2 }]);
  assert.deepEqual(contents([{ id: "x", heading: "পদ্ধতি", body: "" }, { id: "y", heading: "ফল", body: "" }]).map((c) => `${c.n}.${c.id}`), ["1.x", "2.y"]);
});

test("search needs every word, ranks the title first, and reads Bangla digits", () => {
  const list = [
    art({ slug: "flood", title: "বন্যার আগাম সতর্কসংকেত", keywords: ["সেন্সর"], published: "2025-01-01" }),
    art({ slug: "arsenic", title: "আর্সেনিক কিট", summary: "বন্যার পরে পানিতে আর্সেনিক বাড়ে", published: "2025-06-01" }),
    art({ slug: "rice", title: "লবণসহিষ্ণু ধান", institution: "বাংলাদেশ কৃষি বিশ্ববিদ্যালয়", year: 2024, keywords: ["২০২৪"] }),
  ];
  assert.deepEqual(search(list, "বন্যার").map((a) => a.slug), ["flood", "arsenic"]);
  assert.deepEqual(search(list, "বন্যার সেন্সর").map((a) => a.slug), ["flood"]);
  assert.deepEqual(search(list, "কৃষি").map((a) => a.slug), ["rice"]);
  assert.deepEqual(search(list, "2024").map((a) => a.slug), ["rice"]);
  assert.deepEqual(search(list, "Health").length, 3);
  assert.deepEqual(search(list, "   "), []);
  assert.deepEqual(search(list, "চাঁদ"), []);
});

test("the featured pick is published, has a picture, and holds all day", () => {
  const list = [art({ slug: "a", image: { src: "/a.jpg", caption: "" } }), art({ slug: "b" }), art({ slug: "c", status: "review", image: { src: "/c.jpg", caption: "" } }), art({ slug: "d", image: { src: "/d.jpg", caption: "" } })];
  const today = featured(list, "2026-10-02");
  assert.ok(today && ["a", "d"].includes(today.slug));
  assert.equal(featured(list, "2026-10-02"), today);
  assert.equal(featured([art({})], "2026-10-02"), undefined);
  assert.deepEqual(rotate([1, 2, 3], "x", 5).sort(), [1, 2, 3]);
  assert.deepEqual(rotate([], "x", 2), []);
});

test("recent changes run newest first across articles; counts skip what is still in review", () => {
  const list = [
    art({ slug: "a", revisions: [{ at: "2025-01-01", by: "x", note: "প্রথম" }, { at: "2025-03-01", by: "y", note: "ছবি" }] }),
    art({ slug: "b", status: "review", authors: [{ name: "সুমি" }], revisions: [{ at: "2025-02-01", by: "z", note: "জমা" }] }),
  ];
  assert.deepEqual(recentChanges(list, 2).map((r) => `${r.article.slug}:${r.rev.note}`), ["a:ছবি", "b:জমা"]);
  const c = counts(list);
  assert.deepEqual([c.articles, c.authors, c.institutions, c.byKind.paper, c.byField.health], [1, 1, 1, 1, 1]);
});

test("citations list names the Bangla way and end with the link", () => {
  assert.equal(nameList(["ক"]), "ক");
  assert.equal(nameList(["ক", "খ", "গ"]), "ক, খ ও গ");
  assert.equal(citation(art({ authors: [{ name: "রিয়া" }, { name: "তানভীর" }], title: "কিট" }), "https://x/research/kit"), "রিয়া ও তানভীর (2025)। কিট। গবেষণাপত্র, ঢাকা বিশ্ববিদ্যালয়। কাণ্ডারী গবেষণাকোষ। https://x/research/kit");
});

test("references take one line each, and only web links become links", () => {
  assert.deepEqual(parseReferences("WHO guidelines https://www.who.int/x).\n\nবিবিএস ২০২২\njavascript:alert(1)"), [
    { text: "WHO guidelines", url: "https://www.who.int/x" },
    { text: "বিবিএস ২০২২" },
    { text: "javascript:alert(1)" },
  ]);
});

test("a complete draft has no problems; each missing piece is named", () => {
  assert.deepEqual(draftProblems(draft(), 2026), {});
  const p = draftProblems(draft({ title: "ছোট", kind: "", authors: " , ", year: "1950", summary: "ছোট", sections: [{ heading: "এক", body: "অল্প" }], agree: false }), 2026);
  assert.deepEqual(Object.keys(p).sort(), ["agree", "authors", "kind", "sections", "summary", "title", "year"]);
  assert.equal(draftProblems(draft({ year: "2027" }), 2026).year, "১৯৭১ থেকে 2026-এর মধ্যে সাল দিন");
  assert.equal(draftProblems(draft({ sections: [{ heading: "পদ্ধতি", body: "ক".repeat(50) }, { heading: "", body: "ক".repeat(50) }] }), 2026).sections, "প্রতিটি অংশের একটা শিরোনাম দিন");
  assert.equal(draftProblems(draft({ keywords: "a,b,c,d,e,f,g,h,i" }), 2026).keywords, "সর্বোচ্চ ৮টি মূলশব্দ");
});

test("a built article waits for review, drops empty sections, and takes a free slug", () => {
  const a = buildArticle(draft(), { now: new Date("2026-10-02T10:00:00Z"), taken: new Set(["স্মার্টফোনে-আর্সেনিক-মাপার-কিট"]), owner: "acc-1", ownerName: "রিয়া" });
  assert.equal(a.slug, "স্মার্টফোনে-আর্সেনিক-মাপার-কিট-2");
  assert.equal(a.status, "review");
  assert.equal(a.year, 2025);
  assert.equal(a.sections.length, 2);
  assert.deepEqual(a.authors, [{ name: "রিয়া দাস" }, { name: "তানভীর হক" }]);
  assert.deepEqual(a.keywords, ["আর্সেনিক", "পানি", "স্মার্টফোন"]);
  assert.equal(a.references[0].url, "https://www.who.int/publications/i/item/9789241549950");
  assert.equal(a.published, "2026-10-02");
  assert.equal(a.revisions[0].note, "প্রথম জমা — পর্যালোচনার অপেক্ষায়");
  assert.ok(!("supervisor" in a) && !("titleEn" in a));
  assert.equal(new Set(a.sections.map((s) => s.id)).size, 2);
});

test("a paragraph of dash lines is a list; anything else stays text", () => {
  assert.deepEqual(blocks("ভূমিকা।\n\n- এক\n• দুই\n\n- এক\nআর একটা লাইন"), [{ text: "ভূমিকা।" }, { list: ["এক", "দুই"] }, { text: "- এক\nআর একটা লাইন" }]);
});

test("waterfall bars stack on the running sum and totals restart from zero", () => {
  const w = waterfall([{ label: "খামার", value: 40, total: true }, { label: "পরিবহন", value: 2.5 }, { label: "পচন", value: 18.6 }, { label: "খুচরা", value: 61.1, total: true }]);
  assert.deepEqual(w.map((x) => [x.start, Math.round(x.end * 10) / 10]), [[0, 40], [40, 42.5], [42.5, 61.1], [0, 61.1]]);
});

test("reading time and avatar letters", () => {
  assert.equal(readMinutes({ summary: "এক দুই", sections: [] }), 1);
  assert.equal(readMinutes({ summary: "শব্দ ".repeat(360), sections: [{ id: "a", heading: "", body: "", tables: [{ title: "", head: [], rows: [["শব্দ ".repeat(180)]] }] }] }), 3);
  assert.equal(initials("মাহির শারিয়ার মাহিন"), "মামা");
  assert.equal(initials("ক্ষমা"), "ক্ষ");
  assert.equal(initials("  "), "?");
});

test("engagement adds the viewer to other readers, and points weigh each signal", () => {
  const a = art({ engagement: { reactions: { insight: 3 }, shares: 1 }, talk: [{ id: "t", by: "x", at: "2026-01-01", text: "ভালো" }] });
  const e = engagementOf(a, { reaction: "insight", comments: 2, shares: 1, cited: true });
  assert.deepEqual(e, { reactions: { insight: 4, method: 0, useful: 0, inspire: 0 }, comments: 3, shares: 2, cites: 1 });
  assert.equal(pointsOf(e), 4 * POINTS.reaction + 3 * POINTS.comment + 2 * POINTS.share + POINTS.cite);
  assert.equal(pointsOf(engagementOf(art({}))), 0);
});

test("rankings: trending, fields and researchers skip unpublished work", () => {
  const list = [
    art({ slug: "a", field: "health", authors: [{ name: "রিয়া" }], published: "2026-01-01" }),
    art({ slug: "b", field: "economy", authors: [{ name: "রিয়া" }, { name: "তানভীর" }], published: "2026-02-01" }),
    art({ slug: "c", field: "economy", authors: [{ name: "সুমি" }], published: "2026-03-01" }),
    art({ slug: "d", field: "climate", status: "review", authors: [{ name: "জয়" }] }),
  ];
  const pts: Record<string, number> = { a: 10, b: 10, c: 1, d: 99 };
  const score = (x: Article) => pts[x.slug];
  assert.deepEqual(trending(list, score, 2).map((x) => x.slug), ["b", "a"]);
  const f = topFields(list, score);
  assert.deepEqual(f.slice(0, 2), [{ field: "economy", articles: 2, points: 11 }, { field: "health", articles: 1, points: 10 }]);
  assert.equal(f.length, 9);
  assert.equal(f.find((x) => x.field === "climate")!.articles, 0);
  const r = topResearchers(list, score);
  assert.deepEqual(r.map((x) => [x.name, x.articles, x.points]), [["রিয়া", 2, 20 + 2 * POINTS.article], ["তানভীর", 1, 10 + POINTS.article], ["সুমি", 1, 1 + POINTS.article]]);
  assert.deepEqual(related(list, list[1], 5).map((x) => x.slug), ["c", "a"]);
});

test("threads put replies under their comment; order by newest or most liked", () => {
  const n = (id: string, at: string, x: Partial<TalkNote> = {}): TalkNote => ({ id, by: "x", at, text: id, ...x });
  const notes = [n("a", "2026-01-01", { likes: 5 }), n("b", "2026-01-03"), n("r2", "2026-01-05", { parent: "a" }), n("r1", "2026-01-04", { parent: "a" }), n("orphan", "2026-01-02", { parent: "gone" })];
  const likes = (x: TalkNote) => x.likes ?? 0;
  assert.deepEqual(thread(notes, likes, "new").map((t) => t.note.id), ["b", "orphan", "a"]);
  assert.deepEqual(thread(notes, likes, "top").map((t) => t.note.id), ["a", "b", "orphan"]);
  assert.deepEqual(thread(notes, likes, "top")[0].replies.map((r) => r.id), ["r1", "r2"]);
});

test("share links encode the link and text; the feed intent carries a relative link only", () => {
  const l = shareLinks("https://x.org/research/a b", "শিরোনাম & আরও");
  assert.equal(l.facebook, "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fx.org%2Fresearch%2Fa%20b");
  assert.ok(l.x.includes("text=%E0%A6%B6") && l.x.includes("%26"));
  assert.ok(l.whatsapp.startsWith("https://wa.me/?text="));
  const q = new URLSearchParams(feedIntent(art({ slug: "farm-gate", title: "খামার", summary: "ক".repeat(400), keywords: ["এক", "দুই", "তিন", "চার", "পাঁচ"] })).split("?")[1]);
  assert.equal(q.get("u"), "/research/farm-gate");
  assert.equal(q.get("s")!.length, 280);
  assert.equal(q.get("tags"), "এক,দুই,তিন,চার");
});
