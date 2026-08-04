import { parseReplicateWebhook, parseReplicateWebhookOutput, type ReplicateWebhookPayload } from "@/lib/replicate/utils";
import { internal } from "../_generated/api";
import { env, hasEnv } from "../env";
import { verifiedWebhook, verifySharedSecret, verifySvixSignature } from "./verified";

/**
 * Anyone who can guess a prediction id could previously POST a `succeeded` payload here
 * and have an arbitrary URL downloaded, stored, and attached to the real owner's
 * generation — or POST `failed` to destroy any in-flight generation (03-FLAWS F2).
 *
 * Two layers, and the first is never optional:
 *  1. the capability token we appended to the callback URL when creating the prediction;
 *  2. Replicate's own svix signature, when REPLICATE_SIGNING_SECRET is configured.
 *
 * Layer 2 is conditional only because layer 1 has already run unconditionally — this is
 * defence in depth, not "verify if configured".
 */
export const replicateHandler = verifiedWebhook<ReplicateWebhookPayload>({
  verify: async (request, raw) => {
    verifySharedSecret(request, env.REPLICATE_WEBHOOK_SECRET);
    if (hasEnv("REPLICATE_SIGNING_SECRET"))
      await verifySvixSignature(request, raw, env.REPLICATE_SIGNING_SECRET!);
  },
  parse: parseReplicateWebhook,
  handle: async (ctx, body) => {
    if (body.status === 'failed' || body.status === 'canceled') {
      await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
        predictionId: body.id,
        status: 'FAILED'
      });

      return Response.json({ received: true }, { status: 200 });
    }

    if (body.status !== 'succeeded') return Response.json({ received: true }, { status: 200 });

    const output = parseReplicateWebhookOutput(body.output);

    const userId = await ctx.runQuery(internal.router.generations.getUser._internal, { predictionId: body.id });

    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: output.map((url: string) => ({ url })),
      userId,
    });

    await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
      predictionId: body.id,
      imageId: images[0]._id,
    })

    return Response.json({ received: true }, { status: 200 });
  },
})
