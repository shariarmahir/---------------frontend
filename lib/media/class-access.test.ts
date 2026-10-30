import { test } from "node:test";
import assert from "node:assert/strict";
import { findChild, normCode, parentMaySee, studentCode } from "./class-access.ts";

const classes = [
  { id: "c1", name: "দশম", members: [{ id: "s-tania", name: "তানিয়া" }, { id: "s-rahat", name: "রাহাত" }] },
  { id: "c2", name: "কোচিং", members: [{ id: "x", name: "তানিয়া আক্তার", accountId: "s-tania" }] },
];
const labs = [{ id: "l1", name: "ল্যাব", members: [{ id: "s-tania", name: "তানিয়া" }] }];

test("a student ID is stable, short and free of look-alike letters", () => {
  const code = studentCode("s-tania");
  assert.match(code, /^ST-[A-HJ-NP-Z2-9]{6}$/);
  assert.equal(studentCode("s-tania"), code);
  assert.notEqual(studentCode("s-rahat"), code);
});

test("an ID typed any reasonable way reads the same", () => {
  const code = studentCode("s-tania");
  const bare = code.slice(3);
  assert.equal(normCode(bare.toLowerCase()), code);
  assert.equal(normCode(`st ${bare.slice(0, 3)} ${bare.slice(3)}`), code);
  assert.equal(normCode(code), code);
  assert.equal(normCode("ST-ABC10O"), null);
  assert.equal(normCode("ST-ABC"), null);
  assert.equal(normCode(""), null);
});

test("a parent finds every room the child sits in, by member id or account", () => {
  const child = findChild(studentCode("s-tania"), classes, labs);
  assert.ok(child);
  assert.equal(child.name, "তানিয়া");
  assert.deepEqual(child.classes, ["c1", "c2"]);
  assert.deepEqual(child.labs, ["l1"]);
  assert.equal(parentMaySee(child, "c2"), true);
  assert.equal(parentMaySee(child, "c9"), false);
});

test("an unknown or malformed ID finds no one", () => {
  assert.equal(findChild(studentCode("nobody"), classes, labs), null);
  assert.equal(findChild("hello", classes, labs), null);
});
