import { z } from "zod/v4";

/**
 * Environment contract for the Convex deployment.
 *
 * Three rules (architecture/03-FLAWS.md — F3):
 *  1. Never `?? ''` on a secret. A falsy default silently disables the check that reads it.
 *  2. Optional means `.optional()`, so the type forces the caller to handle absence.
 *  3. Never gate a security check on the truthiness of its secret — a missing secret is a
 *     fatal error, not a reason to skip verification.
 *
 * Deliberate deviation from 04-BLUEPRINT §3.3, which validates the whole schema at module
 * load. Two reasons it cannot work here:
 *
 *  - `auth.config.ts` imports this module, and Convex evaluates the auth config in a
 *    sandbox that fails the push if it reads an env var that is not set. Touching every
 *    declared key at import time therefore breaks deploys for exactly the variables that
 *    are *meant* to be absent (REPLICATE_SIGNING_SECRET, TEST_ACCOUNT_*).
 *  - On a live deployment, throwing at boot turns one forgotten variable into a total
 *    outage.
 *
 * So validation is per-key and happens on first access. The security property is
 * unchanged and is the one that matters: reading a missing or malformed secret throws, so
 * the comparison guarding it can never succeed. Use `assertEnv()` for an explicit
 * all-at-once check.
 */

const value = z.string().min(1);
/** Anything used to authenticate a caller. Short values are almost always a placeholder. */
const secret = z.string().min(16);

const schema = z.object({
  // ── Deployment ──────────────────────────────────────────────────────────
  FRONTEND_SITE_URL: value,
  CONVEX_SITE_URL: value,

  // ── Secrets that gate authentication — must never be empty ──────────────
  SERVER_PRIVATE_KEY: secret,
  BOT_DEFAULT_PASSWORD: secret,
  REVENUECAT_WEBHOOK_SECRET: secret,
  KIE_WEBHOOK_HMAC_KEY: secret,
  /** Capability token appended to the Replicate callback URL and verified on receipt. */
  REPLICATE_WEBHOOK_SECRET: secret,
  /** Capability token appended to the RunPod callback URL and verified on receipt. */
  RUNPOD_WEBHOOK_SECRET: secret,
  /** Comma-separated list of `whsec_…` endpoint secrets. */
  STRIPE_WEBHOOK_SECRETS: value,
  /**
   * Replicate's own `whsec_…` signing secret (GET /v1/webhooks/default/secret).
   * Optional: when set, the svix signature is verified *in addition to* the
   * capability token above — never instead of it.
   */
  REPLICATE_SIGNING_SECRET: z.string().optional(),

  // ── Third-party service keys ────────────────────────────────────────────
  STRIPE_SECRET_KEY: value,
  REPLICATE_API_KEY: value,
  KIE_API_KEY: value,
  OPENROUTER_API_KEY: value,
  VOYAGE_API_KEY: value,
  BYTEPLUS_API_KEY: value,
  RUNPOD_API_KEY: value,

  // ── S3 ──────────────────────────────────────────────────────────────────
  S3_APP_KEY: value,
  S3_APP_KEY_ID: value,
  S3_DEFAULT_BUCKET: value,
  S3_ENDPOINT: value,

  // ── Shared test account ─────────────────────────────────────────────────
  // Optional on purpose: leaving these unset is what disables
  // `router/auth/getTestAccount` on a deployment. Never set them in production.
  TEST_ACCOUNT_EMAIL: z.string().optional(),
  TEST_ACCOUNT_PASSWORD: z.string().optional(),
});

type Env = z.infer<typeof schema>;

const shape = schema.shape as Record<string, z.ZodType>;
const KEYS = Object.keys(shape);
const KEY_SET = new Set(KEYS);

/** Validates one variable, reading `process.env` only for that key. */
const check = (key: string) => shape[key].safeParse(process.env[key]);

/**
 * Reads are lazy and validated per key, so one misconfigured variable only breaks the
 * surface that needs it — and a variable that fails validation throws instead of
 * returning `''`.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, property) {
    if (typeof property !== "string" || !KEY_SET.has(property)) return undefined;

    const result = check(property);
    if (!result.success) {
      const reason = result.error.issues.map((issue) => issue.message).join("; ");
      throw new Error(
        `[env] ${property} is missing or invalid in this deployment (${reason}). Refusing to continue.`
      );
    }

    return result.data;
  },
  has: (_target, property) => typeof property === "string" && KEY_SET.has(property),
  ownKeys: () => [...KEYS],
  getOwnPropertyDescriptor: (_target, property) =>
    typeof property === "string" && KEY_SET.has(property)
      ? { enumerable: true, configurable: true }
      : undefined,
});

/** True when the variable is present and valid — for genuinely optional features only. */
export const hasEnv = (key: keyof Env) => check(key).success && !!process.env[key];

/**
 * Validates every declared variable at once and returns the problems.
 * Call it from an internal function or a cron to get a deployment health check —
 * it cannot run at module load without breaking the auth-config push (see the header).
 */
export const assertEnv = () => {
  const problems = KEYS.flatMap((key) => {
    const result = check(key);
    if (result.success) return [];
    return [`${key}: ${result.error.issues.map((issue) => issue.message).join("; ")}`];
  });

  if (problems.length)
    console.error("[env] Invalid Convex environment:\n" + problems.map((p) => `   ${p}`).join("\n"));

  return problems;
};
