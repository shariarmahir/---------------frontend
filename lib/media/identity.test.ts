import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDigits, validateNid, validatePassport } from "./identity.ts";

test("Bangla digits are normalised", () => {
  assert.equal(normalizeDigits("১২৩৪ ৫৬৭৮৯০"), "1234567890");
});

test("NID lengths", () => {
  assert.equal(validateNid("1234567890"), null);
  assert.equal(validateNid("১২৩৪৫৬৭৮৯০১২৩"), null);
  assert.equal(validateNid("19901234567890123"), null);
  assert.equal(validateNid("12345"), "length");
  assert.equal(validateNid("12345678901"), "length");
  assert.equal(validateNid("12345abcde"), "digits");
  assert.equal(validateNid(""), "empty");
});

test("passport formats", () => {
  assert.equal(validatePassport("BN0123456"), null);
  assert.equal(validatePassport("a01234567"), null);
  assert.equal(validatePassport("A0123"), "format");
  assert.equal(validatePassport("123456789"), "format");
  assert.equal(validatePassport(""), "empty");
});
