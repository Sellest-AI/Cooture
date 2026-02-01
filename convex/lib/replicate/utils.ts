import { z } from "zod/v4";

export const ReplicatePredictionSchema = z.object({
  id: z.string(),
  status: z.enum(["starting", "processing", "succeeded", "failed", "canceled"]),
  model: z.string(),
  version: z.string(),
  input: z.record(z.string(), z.any()),
  output: z.union([z.string(), z.any()]).optional(), // Can be string URL or other formats
  error: z.string().nullable().optional(),
  logs: z.string().optional(),
  created_at: z.string(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  data_removed: z.boolean().optional(),
  metrics: z.object({
    predict_time: z.number().optional(),
  }).optional(),
  urls: z.object({
    get: z.string(),
    cancel: z.string(),
    stream: z.string().optional(),
    web: z.string().optional(),
  }),
  webhook: z.string().optional(),
  webhook_events_filter: z.array(z.string()).optional(),
});

const ReplicateWebhookSchema = ReplicatePredictionSchema;
export type ReplicateWebhookPayload = z.infer<typeof ReplicateWebhookSchema>;

// Helper function to parse webhook payload
export const parseReplicateWebhook = (body: unknown) => {
  const result = ReplicateWebhookSchema.safeParse(body);

  if (!result.success)
    throw new Error(`Failed to parse Replicate webhook: ${result.error.message}`);

  return result.data satisfies ReplicateWebhookPayload;
};

export const parseReplicateOutput = (output: unknown) => {
  if (typeof output === 'string') {
    return [output];
  } else if (Array.isArray(output)) {
    return output.filter((item): item is string => typeof item === 'string');
  } else {
    throw new Error('Unexpected Replicate output format');
  }
}