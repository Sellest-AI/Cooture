import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

/** Largest image we will download or decode (bytes). */
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 60_000;
const MAX_REDIRECTS = 3;

/**
 * Addresses a user-supplied URL must never reach: loopback, private networks, link-local
 * (incl. the 169.254.169.254 cloud metadata endpoint), CGNAT, multicast and reserved ranges.
 */
const blockedAddresses = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["224.0.0.0", 3],
] as const) blockedAddresses.addSubnet(network, prefix, "ipv4");
for (const [network, prefix] of [
  ["::", 128], ["::1", 128], ["::ffff:0:0", 96], ["64:ff9b::", 96], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
] as const) blockedAddresses.addSubnet(network, prefix, "ipv6");

/**
 * Rejects anything but a public https URL. The hostname is resolved and *every* address
 * checked, so a public name pointing at an internal IP is refused too.
 */
const assertPublicUrl = async (raw: string) => {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Only https image URLs are allowed");

  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await lookup(hostname, { all: true });

  if (addresses.length === 0) throw new Error("Image host does not resolve");
  for (const { address, family } of addresses)
    if (blockedAddresses.check(address, family === 6 ? "ipv6" : "ipv4"))
      throw new Error("Image URL points to a non-public address");

  return url;
};

/** Reads the body, aborting as soon as it exceeds MAX_IMAGE_BYTES. */
const readCapped = async (response: Response) => {
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_IMAGE_BYTES) throw new Error("Image is too large");
  if (!response.body) throw new Error("Empty image response");

  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  for (; ;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_IMAGE_BYTES) {
      await reader.cancel();
      throw new Error("Image is too large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
};

/**
 * Downloads a user-supplied image URL without letting it reach internal services (SSRF):
 * https only, public addresses only, redirects re-checked hop by hop, size and time capped.
 */
const fetchPublicImage = async (raw: string) => {
  let current = raw;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current);
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect without location");
      current = new URL(location, url).toString();
      continue;
    }

    if (!response.ok) throw new Error('Failed to fetch the image');
    return readCapped(response);
  }
  throw new Error("Too many redirects");
};

export const imageBufferFromUrl = async (base64orUrl: string) => {
  // Check if the string is a URL
  if (base64orUrl.startsWith('http://') || base64orUrl.startsWith('https://'))
    return fetchPublicImage(base64orUrl);

  // It’s a base64 string, convert it to buffer
  const base64Data = base64orUrl.replace(/^data:image\/\w+;base64,/, ''); // Remove base64 prefix
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.byteLength > MAX_IMAGE_BYTES) throw new Error("Image is too large");
  return buffer;
}
