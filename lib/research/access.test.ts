import { test } from "node:test";
import assert from "node:assert/strict";
import { REVIEW_MS, checkAccess, makeRequest, normalizeContact, parseRequests, statusOf, type AccessInput } from "./access.ts";

const good: AccessInput = {
  name: "Riya Rahman",
  contact: "Riya@Example.com ",
  role: "student",
  reason: "Thesis on assistive wearables for blind pedestrians in Dhaka.",
};

test("a complete request passes and is stored in canonical form", () => {
  const r = makeRequest("eye-agent", good, 1000);
  assert.ok(r.ok);
  assert.equal(r.request.contact, "riya@example.com");
  assert.equal(r.request.project, "eye-agent");
  assert.equal(r.request.at, 1000);
});

test("each field is checked", () => {
  const e = checkAccess({ name: "R", contact: "nope", role: "", reason: "short" });
  assert.deepEqual(Object.keys(e).sort(), ["contact", "name", "reason", "role"]);
  assert.ok(checkAccess({ ...good, reason: "x".repeat(501) }).reason);
});

test("roles come only from the list, not from the object's prototype", () => {
  assert.ok(checkAccess({ ...good, role: "toString" as AccessInput["role"] }).role);
});

test("contact takes an email or a Bangladeshi mobile number", () => {
  assert.equal(normalizeContact("+880 1712-345678"), "01712345678");
  assert.equal(normalizeContact("12345"), null);
});

test("pending until the review time has passed, then approved", () => {
  const r = makeRequest("eye-agent", good, 0);
  assert.ok(r.ok);
  assert.equal(statusOf(undefined, 0), "none");
  assert.equal(statusOf(r.request, REVIEW_MS - 1), "pending");
  assert.equal(statusOf(r.request, REVIEW_MS), "approved");
});

test("stored requests are filtered to well-formed entries", () => {
  const r = makeRequest("eye-agent", good, 5);
  assert.ok(r.ok);
  const parsed = parseRequests({
    "eye-agent": r.request,
    other: { ...r.request }, // key and project disagree
    broken: { project: "broken", at: "soon" },
  });
  assert.deepEqual(Object.keys(parsed), ["eye-agent"]);
  assert.deepEqual(parseRequests(null), {});
  assert.deepEqual(parseRequests([1, 2]), {});
});
