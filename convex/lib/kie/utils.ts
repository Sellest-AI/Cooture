import { z } from "zod/v4";

const KieWebhookDataSchema = z.object({
  taskId: z.string(),
  completeTime: z.number().optional(),
  updateTime: z.number().optional(),
  createTime: z.number().optional(),
  costTime: z.number().optional(),
  creditsConsumed: z.number().optional(),
  state: z.enum(['success', 'failed']),
  model: z.string().optional(),
  resultJson: z.unknown().transform((x) => {
    if (typeof x === 'string') {
      const schema = z.object({ resultUrls: z.array(z.string()) });
      const parsed = schema.safeParse(JSON.parse(x));
      return !parsed.success ? { resultUrls: [] } : parsed.data;
    }
    if (typeof x === 'object' && x !== null) {
      const schema = z.object({ resultUrls: z.array(z.string()) });
      const parsed = schema.safeParse(x);
      return !parsed.success ? { resultUrls: [] } : parsed.data;
    }
    return { resultUrls: [] };
  }),
});

const KieWebhookSchema = z.object({
  code: z.number(),
  msg: z.string(),
  data: KieWebhookDataSchema
});

export type KieWebhookPayload = z.infer<typeof KieWebhookSchema>;

export const parseKieWebhook = (body: unknown) => {
  const result = KieWebhookSchema.safeParse(body);

  if (!result.success)
    throw new Error(`Failed to parse Kie webhook: ${result.error.message}`);

  return result.data satisfies KieWebhookPayload;
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

export const verifyKieWebhookSignature = async (
  taskId: string,
  timestampSeconds: string,
  signature: string,
  secret: string,
) => {
  if (!taskId || !timestampSeconds || !signature || !secret) return false;

  const message = `${taskId}.${timestampSeconds}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const expected = toBase64(new Uint8Array(signed));

  return constantTimeEqual(expected, signature);
};

export const parseKieWebhookOutput = (payload: KieWebhookPayload) => {
  const urls = payload.data.resultJson?.resultUrls ?? [];
  return Array.from(new Set(urls)).filter((url) => url.length > 0);
};