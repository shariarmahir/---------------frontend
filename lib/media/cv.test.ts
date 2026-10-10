import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCv, emptyCv, skillNames } from "./cv.ts";
import type { Person } from "../../data/media/types.ts";

const person = {
  name: "Rina",
  nameBn: "রিনা",
  headline: "দর্জি",
  area: "নকলা",
  district: "শেরপুর",
  bio: "সেলাই করি।",
  skills: [{ skill: "সেলাই", category: "arts", self: 4, communityAvg: 4, raters: 6 }],
  workHistory: [{ id: "w1", title: "বিয়ের পোশাক", client: "সুমি", date: "2026-03-02", amount: 3000, rating: 5, review: "সুন্দর হয়েছে" }],
} as unknown as Person;

test("a finished course adds a skill once, after the claimed ones", () => {
  const done = [
    { id: "FSH-101", title: "পোশাক নকশা", dept: "ফ্যাশন" },
    { id: "FSH-102", title: "সেলাই", dept: "ফ্যাশন" },
  ];
  assert.deepEqual(skillNames(person.skills, done), ["সেলাই", "পোশাক নকশা"]);
});

test("the CV draws on the profile, the extras and the academy", () => {
  const cv = buildCv(person, { ...emptyCv, phone: "01700000000", languages: "বাংলা, English" }, [{ id: "FSH-101", title: "পোশাক নকশা", dept: "ফ্যাশন" }], "kandari.test/u/rina");
  assert.equal(cv.summary, "সেলাই করি।");
  assert.deepEqual(cv.contact, ["01700000000", "নকলা, শেরপুর", "kandari.test/u/rina"]);
  assert.equal(cv.experience[0].place, "সুমি");
  assert.equal(cv.training[0].place, "কাণ্ডারী তৈরি একাডেমি");
  assert.deepEqual(cv.languages, ["বাংলা", "English"]);
});

test("a written summary replaces the bio", () => {
  assert.equal(buildCv(person, { ...emptyCv, summary: "  নিজের কথা  " }, [], "").summary, "নিজের কথা");
});
