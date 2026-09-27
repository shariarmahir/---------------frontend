import { test } from "node:test";
import assert from "node:assert/strict";
import { AUTH_RULES, DEMO_ACCOUNTS, FOLLOWABLE_PRODUCTS, isProtected } from "../../data/auth.ts";
import { products } from "../../data/products.ts";
import {
  changePassword,
  consumeLink,
  currentAccount,
  deleteAccount,
  passwordLogin,
  register,
  requestLink,
  requestOtp,
  seed,
  signOut,
  updateAccount,
  verifyOtp,
  type AuthDb,
  type SignupInput,
} from "./core.ts";
import { formatPhone, isEmail, maskPhone, normalizePhone, passwordIssues, passwordStrength, safeNext } from "./validate.ts";

const T0 = Date.UTC(2026, 8, 27, 6);
/** Deterministic "random" so OTP codes are predictable in tests. */
const rand = (() => {
  let i = 0;
  return () => ((i++ * 7) % 10) / 10;
})();

function unwrap<T>(r: { ok: true; db: AuthDb; value: T } | { ok: false; error: string }): { db: AuthDb; value: T } {
  if (!r.ok) throw new Error(`expected ok, got ${r.error}`);
  return r;
}

const mahir = DEMO_ACCOUNTS[0];

test("phone numbers normalise from every common form", () => {
  for (const raw of ["01700000001", "+8801700000001", "8801700000001", "০১৭০০-০০০০০১", "017 0000 0001"]) {
    assert.equal(normalizePhone(raw), "01700000001", raw);
  }
  for (const bad of ["0170000000", "01200000001", "11700000001", "hello", ""]) assert.equal(normalizePhone(bad), null, bad);
  assert.equal(formatPhone("01700000001"), "০১৭০০-০০০০০১");
  assert.equal(maskPhone("01700000001"), "০১৭•••••০১");
});

test("email and password rules", () => {
  assert.ok(isEmail(" Mahir@Kandari-Lab.com "));
  assert.ok(!isEmail("mahir@kandari"));
  assert.ok(!isEmail("a b@c.com"));
  assert.deepEqual(passwordIssues("abc"), ["short", "digit"]);
  assert.deepEqual(passwordIssues("Kandari2026"), []);
  assert.deepEqual(passwordIssues("১২৩৪৫৬৭৮৯"), ["letter"]);
  assert.ok(passwordStrength("Kandari2026!xyz") > passwordStrength("kandari1"));
});

test("safeNext keeps people on this site", () => {
  assert.equal(safeNext("/media/wallet?tab=1"), "/media/wallet?tab=1");
  for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/login?next=/x", "/signup", null, ""]) {
    assert.equal(safeNext(bad), "/account", String(bad));
  }
});

test("protected routes", () => {
  assert.ok(isProtected("/account"));
  assert.ok(isProtected("/media/messages/abc"));
  assert.ok(isProtected("/media"), "the whole media platform is members-only");
  assert.ok(isProtected("/media/market"));
  assert.ok(isProtected("/media/u/shapla"));
  assert.ok(!isProtected("/mediator"));
  assert.ok(!isProtected("/"));
  assert.ok(!isProtected("/cholo-bangladesh-gori"));
  assert.ok(!isProtected("/accountant"));
});

test("followable products exist", () => {
  for (const p of FOLLOWABLE_PRODUCTS) assert.ok(products.some((x) => x.slug === p.slug), p.slug);
});

test("demo accounts sign in with their password, by email or phone", () => {
  const db = seed();
  const byEmail = unwrap(passwordLogin(db, "MAHIR@kandari-lab.com", mahir.password, T0));
  assert.equal(byEmail.value.id, "acc-mahir");
  assert.equal(currentAccount(byEmail.db, T0)?.name, mahir.name);
  assert.ok(!("passwordHash" in byEmail.value), "hash never leaves the gateway");
  const byPhone = unwrap(passwordLogin(db, "+880 1700-000001", mahir.password, T0));
  assert.equal(byPhone.db.session?.method, "password");
});

test("wrong passwords count down, then lock", () => {
  let db = seed();
  for (let i = 1; i < AUTH_RULES.passwordMaxFailures; i++) {
    const r = passwordLogin(db, mahir.email!, "wrong-pass1", T0);
    assert.ok(!r.ok && r.error === "credentials_wrong" && r.attemptsLeft === AUTH_RULES.passwordMaxFailures - i);
    db = r.db;
  }
  const locked = passwordLogin(db, mahir.email!, "wrong-pass1", T0);
  assert.ok(!locked.ok && locked.error === "locked");
  const stillLocked = passwordLogin(locked.db, mahir.email!, mahir.password, T0 + 1000);
  assert.ok(!stillLocked.ok && stillLocked.error === "locked" && stillLocked.retryIn! > 0);
  const after = passwordLogin(locked.db, mahir.email!, mahir.password, T0 + AUTH_RULES.lockoutMs + 1);
  assert.ok(after.ok);
  const unknown = passwordLogin(seed(), "nobody@example.com", "whatever1", T0);
  assert.ok(!unknown.ok && unknown.error === "credentials_wrong", "unknown email looks the same as a wrong password");
});

test("OTP login: code, wrong attempts, expiry, resend cooldown", () => {
  const sent = unwrap(requestOtp(seed(), "01700000001", "login", T0, rand));
  assert.equal(sent.value.code.length, AUTH_RULES.otpLength);
  const tooSoon = requestOtp(sent.db, "01700000001", "login", T0 + 5000, rand);
  assert.ok(!tooSoon.ok && tooSoon.error === "otp_cooldown" && tooSoon.retryIn === 25);

  const wrong = verifyOtp(sent.db, "01700000001", "000000" === sent.value.code ? "111111" : "000000", T0);
  assert.ok(!wrong.ok && wrong.error === "otp_wrong" && wrong.attemptsLeft === AUTH_RULES.otpMaxAttempts - 1);
  const right = unwrap(verifyOtp(wrong.db, "০১৭০০০০০০০১", sent.value.code.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]), T0 + 1000));
  assert.equal(right.value.account?.id, "acc-mahir");
  assert.equal(right.db.session?.method, "otp");
  const reused = verifyOtp(right.db, "01700000001", sent.value.code, T0 + 2000);
  assert.ok(!reused.ok && reused.error === "otp_expired", "a code works once");

  const expired = verifyOtp(sent.db, "01700000001", sent.value.code, T0 + AUTH_RULES.otpTtlMs + 1);
  assert.ok(!expired.ok && expired.error === "otp_expired");

  const noAccount = requestOtp(seed(), "01311111111", "login", T0, rand);
  assert.ok(!noAccount.ok && noAccount.error === "no_account");
});

test("too many wrong codes burns the code", () => {
  let db = unwrap(requestOtp(seed(), "01700000001", "login", T0, rand)).db;
  const code = db.otp["01700000001"].code;
  const bad = code === "999999" ? "888888" : "999999";
  let last;
  for (let i = 0; i < AUTH_RULES.otpMaxAttempts; i++) {
    last = verifyOtp(db, "01700000001", bad, T0);
    db = last.db;
  }
  assert.ok(last && !last.ok && last.error === "otp_locked");
  const late = verifyOtp(db, "01700000001", code, T0);
  assert.ok(!late.ok && late.error === "otp_expired");
});

const newcomer: SignupInput = {
  name: "নুসরাত জাহান",
  phone: "01555000111",
  email: "nusrat@example.com",
  password: "Nakla2026",
  role: "citizen",
  district: "শেরপুর",
  sectors: ["health"],
  products: ["aponjon"],
  notify: { sms: true, email: true },
};

test("sign-up needs a verified phone, then signs in", () => {
  const db = seed();
  const early = register(db, newcomer, T0, rand);
  assert.ok(!early.ok && early.error === "phone_unverified");
  const taken = requestOtp(db, "01700000001", "signup", T0, rand);
  assert.ok(!taken.ok && taken.error === "phone_taken");

  const sent = unwrap(requestOtp(db, newcomer.phone, "signup", T0, rand));
  const verified = unwrap(verifyOtp(sent.db, newcomer.phone, sent.value.code, T0));
  assert.equal(verified.value.purpose, "signup");
  assert.equal(verified.db.session, null, "verifying the phone alone does not sign in");

  const dupEmail = register(verified.db, { ...newcomer, email: "MAHIR@kandari-lab.com" }, T0, rand);
  assert.ok(!dupEmail.ok && dupEmail.error === "email_taken");
  const weak = register(verified.db, { ...newcomer, password: "short" }, T0, rand);
  assert.ok(!weak.ok && weak.error === "password_weak");
  const noSector = register(verified.db, { ...newcomer, sectors: [] }, T0, rand);
  assert.ok(!noSector.ok && noSector.error === "sectors_missing");

  const done = unwrap(register(verified.db, newcomer, T0, rand));
  assert.equal(currentAccount(done.db, T0)?.id, done.value.id);
  assert.equal(done.db.session?.method, "signup");
  assert.equal(done.value.email, "nusrat@example.com");

  const again = unwrap(passwordLogin(signOut(done.db), "nusrat@example.com", newcomer.password, T0 + 10));
  assert.equal(again.value.id, done.value.id);
});

test("email links are single-use, expire, and do not reveal accounts", () => {
  const sent = unwrap(requestLink(seed(), "rafi@example.com", T0, rand));
  assert.ok(sent.value.token);
  const used = unwrap(consumeLink(sent.db, sent.value.token!, T0 + 1000));
  assert.equal(used.value.id, "acc-rafi");
  const twice = consumeLink(used.db, sent.value.token!, T0 + 2000);
  assert.ok(!twice.ok && twice.error === "link_invalid");
  const late = consumeLink(sent.db, sent.value.token!, T0 + AUTH_RULES.linkTtlMs + 1);
  assert.ok(!late.ok && late.error === "link_expired");
  const nobody = unwrap(requestLink(seed(), "nobody@example.com", T0, rand));
  assert.equal(nobody.value.token, null);
});

test("sessions expire", () => {
  const { db } = unwrap(passwordLogin(seed(), mahir.email!, mahir.password, T0));
  assert.ok(currentAccount(db, T0 + AUTH_RULES.sessionMs - 1));
  assert.equal(currentAccount(db, T0 + AUTH_RULES.sessionMs), null);
});

test("account edits, password change and deletion", () => {
  const { db } = unwrap(passwordLogin(seed(), mahir.email!, mahir.password, T0));
  const edited = unwrap(updateAccount(db, T0, { sectors: ["ai"], email: "  NEW@Example.com " }));
  assert.deepEqual(edited.value.sectors, ["ai"]);
  assert.equal(edited.value.email, "new@example.com");
  const clash = updateAccount(db, T0, { email: "shapla@example.com" });
  assert.ok(!clash.ok && clash.error === "email_taken");

  const badCurrent = changePassword(db, T0, "nope", "Better2027");
  assert.ok(!badCurrent.ok && badCurrent.error === "credentials_wrong");
  const changed = unwrap(changePassword(db, T0, mahir.password, "Better2027"));
  assert.ok(!passwordLogin(signOut(changed.db), mahir.email!, mahir.password, T0).ok);
  assert.ok(passwordLogin(signOut(changed.db), mahir.email!, "Better2027", T0).ok);

  const gone = unwrap(deleteAccount(db, T0, mahir.password));
  assert.equal(gone.db.session, null);
  assert.ok(!passwordLogin(gone.db, mahir.email!, mahir.password, T0).ok);
  assert.ok(!updateAccount(signOut(db), T0, { name: "x y z" }).ok);
});
