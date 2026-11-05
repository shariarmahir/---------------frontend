/**
 * Built-in settings so HQ can be tried on a host that has none of its HQ_*
 * variables (a Vercel test deploy, Mahir 2026-10-23). Each one is used only
 * while its variable is unset, so .env.local still wins on a dev machine.
 *
 * Everything here is public (it sits in the repository): set the real
 * variables, with a new password, and HQ_DEMO_PASSWORD=off, before the real
 * team signs in.
 */

/** The open password for the demo sign-ins and the test prime account. */
export const TEST_PASSWORD = "amra-kandari";

/** The super prime admin's test sign-in: Mahir's address and TEST_PASSWORD, as scripts/hq-hash.mjs packs it. */
export const TEST_PRIME_EMAIL = "itallinyou.justdoit@gmail.com";
export const TEST_PRIME_HASH =
  "scrypt:9cf4903ab142cc4557c9fdefeabf3835:c235315ea25f08b1ae3f68265d2e580ecf304ebed88ea5705aadad56837b953fe204909fbf941e806756b85209b90cbc1ea91be47a6819857c9584bcadb54abc";

/** Signs sessions in production when HQ_SESSION_SECRET is unset; every server instance shares it. */
export const TEST_SESSION_SECRET = "89b23c40140685d67c50f3e79df489a7b8969ed767eedc74fa1f7f5a1ff100731d3767e06cd9a3d6c54367a6b204acc5";
