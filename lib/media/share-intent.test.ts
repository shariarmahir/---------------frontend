import { test } from "node:test";
import assert from "node:assert/strict";
import { intentCaption, isSitePath, readIntent } from "./share-intent.ts";

const q = (o: Record<string, string>) => new URLSearchParams(o);

test("only same-site paths are accepted", () => {
  for (const ok of ["/research/farm-gate-to-fake-seal", "/research/স্মার্টফোনে-কিট", "/research/a?x=1#y"]) assert.ok(isSitePath(ok), ok);
  for (const bad of ["https://evil.example", "//evil.example/x", String.raw`/\evil.example`, "javascript:alert(1)", "/a b", "/a\"onmouseover", "research/x", ""]) assert.equal(isSitePath(bad), false, bad);
  assert.equal(readIntent(q({ u: "//evil.example", t: "শিরোনাম" })), null);
});

test("a share request becomes a trimmed link card with hashtags", () => {
  const i = readIntent(q({ u: "/research/farm-gate", t: "  খামার থেকে\nনকল সিল ", s: "সারাংশ ".repeat(100), src: "গবেষণাকোষ", k: "গবেষণাপত্র", tags: "মূল্যশৃঙ্খল, নকল পণ্য,#বিএসটিআই,,এক,দুই,তিন" }))!;
  assert.equal(i.link.href, "/research/farm-gate");
  assert.equal(i.link.title, "খামার থেকে নকল সিল");
  assert.ok(i.link.summary!.length <= 400);
  assert.deepEqual(i.tags, ["#মূল্যশৃঙ্খল", "#নকল_পণ্য", "#বিএসটিআই", "#এক", "#দুই"]);
  assert.equal(intentCaption(i).split("\n")[0], "নতুন গবেষণাপত্র: খামার থেকে নকল সিল");
});

test("a title is required; the source has a default", () => {
  assert.equal(readIntent(q({ u: "/research/x", t: " " })), null);
  const i = readIntent(q({ u: "/research/x", t: "শিরোনাম" }))!;
  assert.equal(i.link.source, "কাণ্ডারী");
  assert.equal(intentCaption(i), "শিরোনাম");
});
