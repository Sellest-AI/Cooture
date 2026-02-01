import { parseReplicateOutput, parseReplicateWebhook } from "@/lib/replicate/utils";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const replicateHandler = httpAction(async (ctx, request) => {
  // Handle the Replicate webhook request here
  const json = await request.json();
  const body = parseReplicateWebhook(json);
  const output = parseReplicateOutput(body.output);

  const userId = await ctx.runQuery(internal.router.generations.getUser._internal, { predictionId: body.id });

  if (body.status === 'failed' || body.status === 'canceled')
    await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
      predictionId: body.id,
      status: 'FAILED'
    });

  if (body.status !== 'succeeded') return Response.json({ received: true }, { status: 200 });

  const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
    images: output.map((url: string) => ({ url })),
    userId,
  });

  await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
    predictionId: body.id,
    imageId: images[0]._id,
  })

  return Response.json({ received: true }, { status: 200 });
})