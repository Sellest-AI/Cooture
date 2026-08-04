/**
 * Comparison whose running time does not depend on how many leading characters match.
 * Use it for every secret comparison — `a === b` short-circuits on the first differing
 * character and leaks the prefix under repeated timing measurement.
 *
 * The length check is intentional and standard: it leaks only the length, never content.
 */
export const constantTimeEqual = (a: string, b: string) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);

  return result === 0;
};

/**
 * Appends the capability token that `verifySharedSecret` checks to a provider callback URL.
 * Lives here rather than in `http/verified.ts` so `"use node"` job submitters can import it
 * without pulling in the whole procedures/api graph.
 */
export const withWebhookToken = (url: string, secret: string) =>
  `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(secret)}`;

export const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

export const fromBase64 = (base64: string) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/** HMAC-SHA256 of `message`, base64-encoded. `secret` may be raw text or raw bytes. */
export const hmacSha256Base64 = async (secret: string | Uint8Array, message: string) => {
  const encoder = new TextEncoder();
  const keyData = typeof secret === "string" ? encoder.encode(secret) : secret;

  const key = await crypto.subtle.importKey(
    "raw",
    keyData as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64(new Uint8Array(signed));
};
