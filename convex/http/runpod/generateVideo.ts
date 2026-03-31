import { taskNames, taskStatus } from "@/lib/runpod";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { httpAction, internalAction } from "../../_generated/server";
import { env } from "../../env";

const CallbackSchema = z.object({
  userId: z.string(),
  task: z.object({ name: z.enum(taskNames), version: z.string() }),
  imageId: z.string().optional(),
  video: z.object({
    width: z.number(),
    height: z.number(),
    durationMs: z.number(),
    fps: z.number(),
  })
});

const OutputSchema = z.object({
  callback: CallbackSchema,
  images: z.array(z.string()).optional(),
  texts: z.array(z.object({
    filename: z.string(),
    content_raw: z.string(),
    content_parsed: z.json().optional(),
    type: z.enum(['text', 'json'])
  })).optional(),
});

const WebhookBasicTaskSchema = z.object({
  id: z.string(),
  status: z.enum(taskStatus),
});

const WebhookTaskSchema = WebhookBasicTaskSchema.extend({
  delayTime: z.number(),
  executionTime: z.number(),
  input: z.object({
    callback: CallbackSchema,
  }).optional(),
  output: OutputSchema.optional(),
})

const generateVideoSchemaValidator = {
  userId: v.id("users"),
  videoTmpPath: v.string(),
  predictionId: v.string(),
  baseImageId: v.optional(v.string()),
  video: v.object({
    width: v.number(),
    height: v.number(),
    fps: v.number(),
    durationMs: v.number(),
  }),
}

export const _internal_process = internalAction({
  args: generateVideoSchemaValidator,
  handler: async (ctx, args) => {
    const { userId, predictionId, videoTmpPath, baseImageId, video } = args;

    const endpoint = `${env.S3_DEFAULT_BUCKET}.${env.S3_ENDPOINT}`;
    const endpointUrl = `${endpoint}/${videoTmpPath}`.replaceAll('//', '/');
    const videoUrl = `https://${endpointUrl}`;

    const uploadedVideo = await ctx.runAction(internal.router.storage.videos.uploadOne._internal, {
      userId,
      url: videoUrl,
      tmpKey: videoTmpPath,
      dimensions: { width: video.width, height: video.height },
      durationMs: video.durationMs,
      baseImageId: baseImageId as Id<'images'> | undefined,
      fps: video.fps,
    })

    await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
      predictionId,
      videoId: uploadedVideo._id,
    })

  }
})

export const runpodGenerateVideoHandler = httpAction(async (ctx, request) => {
  // Handle the Replicate webhook request here
  const json = await request.json();

  const base = WebhookBasicTaskSchema.parse(json);

  if (base.status === 'FAILED' || base.status === 'TIMED_OUT' || base.status === 'CANCELLED') {
    await ctx.runMutation(internal.router.generations.updatePrediction._internal,
      { predictionId: base.id, status: 'FAILED' })
    return Response.json({ received: true }, { status: 200 });
  }

  const body = WebhookTaskSchema.parse(json);

  if (body.status !== 'COMPLETED')
    return Response.json({ received: true }, { status: 200 });

  if (!body.output) {
    return Response.json({ received: true }, { status: 200 });
  }

  const callback = body.output.callback;
  const userId = callback.userId as Id<'users'>;

  const videoTmpPath = body.output?.texts?.[0]?.content_raw;
  if (!videoTmpPath) {
    return Response.json({ received: true }, { status: 200 });
  }

  await ctx.scheduler.runAfter(0, internal.http.runpod.generateVideo._internal_process, {
    userId,
    predictionId: body.id,
    baseImageId: callback.imageId,
    videoTmpPath,
    video: {
      durationMs: callback.video.durationMs,
      width: callback.video.width,
      height: callback.video.height,
      fps: callback.video.fps,
    }
  })

  return Response.json({ received: true }, { status: 200 });
})