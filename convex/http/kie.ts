import { type KieWebhookPayload, parseKieWebhook, parseKieWebhookOutput } from "@/lib/kie/utils";
import { internal } from "../_generated/api";
import { env } from "../env";
import { verifiedWebhook, verifyHmacSignature } from "./verified";

/**
 * The HMAC check used to be wrapped in `if (env.KIE_WEBHOOK_HMAC_KEY)`, so a deployment
 * that forgot the variable accepted every unsigned callback (03-FLAWS F3). It is now
 * unconditional: reading the key throws when it is unset, which the wrapper turns into a
 * 401 rather than a skipped check.
 */
export const kieHandler = verifiedWebhook<KieWebhookPayload>({
  verify: async (request, raw) => {
    const taskId = parseKieWebhook(JSON.parse(raw)).data.taskId;
    const timestamp = request.headers.get('x-webhook-timestamp') ?? '';
    const signature = request.headers.get('x-webhook-signature') ?? '';

    if (!taskId || !timestamp) throw new Error("Missing Kie signature headers");

    await verifyHmacSignature(`${taskId}.${timestamp}`, signature, env.KIE_WEBHOOK_HMAC_KEY);
  },
  parse: parseKieWebhook,
  handle: async (ctx, body) => {
    const taskId = body.data.taskId;
    const status = body.data.state;

    if (status === 'failed') {
      await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
        predictionId: taskId,
        status: 'FAILED'
      });

      return Response.json({ received: true }, { status: 200 });
    }

    if (status !== 'success') return Response.json({ received: true }, { status: 200 });

    const output = parseKieWebhookOutput(body);
    if (!output.length) return Response.json({ received: true }, { status: 200 });

    const userId = await ctx.runQuery(internal.router.generations.getUser._internal, { predictionId: taskId });

    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: output.map((url: string) => ({ url })),
      userId,
    });

    await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
      predictionId: taskId,
      imageId: images[0]._id,
    })

    return Response.json({ received: true }, { status: 200 });
  },
})
