// Hashes a কাণ্ডারী HQ password for HQ_PRIME_PASSWORD_HASH (scrypt, the same
// settings as lib/hq/server/crypto.ts).
//   node scripts/hq-hash.mjs            → asks for the password (not echoed into shell history)
//   echo "secret" | node scripts/hq-hash.mjs
import { randomBytes, scryptSync } from "node:crypto";

const chunks = [];
for await (const c of process.stdin) chunks.push(c);
const password = Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password.normalize("NFKC"), salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex");
console.log(`scrypt:${salt}:${hash}`);
