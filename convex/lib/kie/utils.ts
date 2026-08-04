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

// The H-tMAC/base64/constantime helpers that used to live here are now in lib/crypto,
// and http/kie.ts verifies through http/verified.ts so the check cannot be skipped.

export const parseKieWebhookOutput = (payload: KieWebhookPayload) => {
  const urls = payload.data.resultJson?.resultUrls ?? [];
  return Array.from(new Set(urls)).filter((url) => url.length > 0);
};