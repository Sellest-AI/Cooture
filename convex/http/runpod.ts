import { taskNames, taskStatus } from "@/lib/runpod";
import { z } from "zod";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { httpAction } from "../_generated/server";

const CallbackSchema = z.object({
  userId: z.string(),
  task: z.object({
    name: z.enum(taskNames),
    version: z.string()
  })
});

const OutputSchema = z.object({
  callback: CallbackSchema,
});

const WebhookTaskSchema = z.object({
  delayTime: z.number(),
  executionTime: z.number(),
  id: z.string(),
  status: z.enum(taskStatus),
  input: z.object({
    callback: z.object({
      userId: z.string(),
    })
  }).optional(),
  output: OutputSchema.optional(),
})

const RemoveBackgroundTaskSchema = WebhookTaskSchema.extend({
  output: OutputSchema.extend({
    callback: CallbackSchema.extend({
      nextStep: z.enum(['SAVE_IMAGE', 'CREATE_ITEM']),
    }),
    url: z.string(),
    position: z.object({
      left: z.number(),
      top: z.number(),
      width: z.number(),
      height: z.number()
    }),
  }).optional(),
})

export const runpodHandler = httpAction(async (ctx, request) => {
  // Handle the Replicate webhook request here
  const json = await request.json();

  const body = RemoveBackgroundTaskSchema.parse(json);

  if (!body.output) {
    return Response.json({ received: true }, { status: 200 });
  }

  const callback = body.output.callback;
  const userId = callback.userId as Id<'users'>;

  const image = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
    userId: userId,
    images: [{
      base64: body.output.url,
      tags: ['OBJECT']
    }]
  })

  if (callback.nextStep === 'CREATE_ITEM') {
    await ctx.scheduler.runAfter(0, internal.router.items.createOne._internal, {
      userId: userId,
      imageId: image[0]._id,
    })
  }

  return Response.json({ received: true }, { status: 200 });
})