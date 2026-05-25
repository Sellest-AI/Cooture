import { parseKieWebhook, parseKieWebhookOutput, verifyKieWebhookSignature } from "@/lib/kie/utils";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";
import { env } from "../env";

export const kieHandler = httpAction(async (ctx, request) => {
  // Handle the Kie webhook request here
  const json = await request.json();
  const body = parseKieWebhook(json);
  const taskId = body.data.taskId;

  if (env.KIE_WEBHOOK_HMAC_KEY) {
    const timestamp = request.headers.get('x-webhook-timestamp') ?? '';
    const signature = request.headers.get('x-webhook-signature') ?? '';
    const isValid = await verifyKieWebhookSignature(taskId, timestamp, signature, env.KIE_WEBHOOK_HMAC_KEY);

    if (!isValid) return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const status = body.data.state;
  const isFailed = status === 'failed';

  if (isFailed) {
    await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
      predictionId: taskId,
      status: 'FAILED'
    });

    return Response.json({ received: true }, { status: 200 });
  }

  const isSucceeded = status === 'success';
  if (!isSucceeded) return Response.json({ received: true }, { status: 200 });

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
})