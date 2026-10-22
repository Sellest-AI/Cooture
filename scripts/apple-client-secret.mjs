/**
 * Prints a fresh Sign in with Apple client secret on stdout, and its expiry on stderr.
 *
 *   node scripts/apple-client-secret.mjs ~/Downloads/AuthKey_J7KDKDHS4A.p8
 *   APPLE_SIGN_IN_KEY="$(cat AuthKey.p8)" node scripts/apple-client-secret.mjs
 *
 * The secret is an ES256 JWT signed by the .p8 key, read by `convex/auth.ts` as `AUTH_APPLE_SECRET`.
 * Apple refuses one that lives longer than six months, so `.github/workflows/apple-secret.yml` runs
 * this the second way every two months and sets the result on both Convex deployments; the first
 * way is for renewing by hand. The ids below are identifiers, not secrets: only the .p8 is, and it
 * never enters the repo.
 */
import { Buffer } from "node:buffer";
import { createPrivateKey, sign } from "node:crypto";
import { readFileSync } from "node:fs";

/** Developer portal → Keys. Changes only if the key is revoked and replaced. */
const KEY_ID = "J7KDKDHS4A";
/** Developer portal → Membership details. */
const TEAM_ID = "VD33R9X5X3";
/** The Services ID carrying the return URLs; also `AUTH_APPLE_ID` on both deployments. */
const SERVICES_ID = "com.cooture.app.signin";
/** Apple's cap is 15777000 s, a little over 182 days; 180 keeps clear of it. */
const LIFETIME_S = 180 * 24 * 60 * 60;

const keyFile = process.argv[2];
const privateKey = keyFile ? readFileSync(keyFile, "utf8") : process.env.APPLE_SIGN_IN_KEY;
if (!privateKey) {
  console.error("Pass the .p8 path, or set APPLE_SIGN_IN_KEY to its contents.");
  process.exit(1);
}

const base64url = (json) => Buffer.from(JSON.stringify(json)).toString("base64url");

const issuedAt = Math.floor(Date.now() / 1000);
const expiresAt = issuedAt + LIFETIME_S;
const header = base64url({ alg: "ES256", kid: KEY_ID });
const payload = base64url({ iss: TEAM_ID, iat: issuedAt, exp: expiresAt, aud: "https://appleid.apple.com", sub: SERVICES_ID });
// JWS wants the raw r||s pair; Node signs ECDSA as DER unless told otherwise.
const signature = sign("sha256", Buffer.from(`${header}.${payload}`), {
  key: createPrivateKey(privateKey),
  dsaEncoding: "ieee-p1363",
}).toString("base64url");

process.stdout.write(`${header}.${payload}.${signature}`);
console.error(`Expires ${new Date(expiresAt * 1000).toISOString().slice(0, 10)}`);
