import { taskNames, taskStatus } from "@/lib/runpod";
import { zodToConvexFields } from "convex-helpers/server/zod4";
import { v } from "convex/values";
import { z } from "zod/v4";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { httpAction, internalAction } from "../../_generated/server";

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
      nextStep: z.enum(['SAVE_IMAGE', 'CREATE_ITEM', 'UPDATE_ITEM']),
      nextArgs: z.object({
        UPDATE_ITEM: z.optional(z.object({
          itemId: z.string().transform((val) => val as Id<'items'>),
        })),
        CREATE_ITEM: z.optional(z.object({
          brand: z.optional(z.string()),
          name: z.optional(z.string()),
          description: z.optional(z.string()),
          itemUrl: z.optional(z.string()),
          gender: z.optional(z.string()),
          fit: z.optional(z.string()),
          materials: z.optional(z.array(z.string())),
          sku: z.optional(z.string()),
          price: z.optional(z.object({
            amount: z.number(), // stored in minor units (cents) — avoids float issues
            currency: z.enum(["EUR", "USD"]), // hardcoded for now, extensible later
          })),
        })),
      })
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

export const REMOVE_BACKGROUND_NEXT_STEP = v.union(...RemoveBackgroundTaskSchema.shape.output.unwrap().shape.callback.shape.nextStep.options.map((o) => v.literal(o)));
export const REMOVE_BACKGROUND_NEXT_ARGS = v.object(zodToConvexFields(RemoveBackgroundTaskSchema.shape.output.unwrap().shape.callback.shape.nextArgs.shape))

const removeBackgroundSchemaValidator = v.object({
  url: v.string(),
  callback: v.object({
    userId: v.id("users"),
    nextStep: v.optional(REMOVE_BACKGROUND_NEXT_STEP),
    nextArgs: v.optional(REMOVE_BACKGROUND_NEXT_ARGS)
  })
})

export const _internal_process = internalAction({
  args: {
    removeBackgroundData: removeBackgroundSchemaValidator,
  },
  handler: async (ctx, args) => {
    const { removeBackgroundData } = args;

    if (removeBackgroundData) {
      const { callback: { userId, nextStep, nextArgs }, url } = removeBackgroundData;

      const image = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
        userId: userId,
        images: [{
          base64: url,
          tags: ['OBJECT']
        }]
      })

      if (nextStep === 'CREATE_ITEM') {
        await ctx.scheduler.runAfter(0, internal.router.items.createOne._internal, {
          userId: userId,
          imageId: image[0]._id,
          metadata: nextArgs?.CREATE_ITEM
        })
      }

      if (nextStep === 'UPDATE_ITEM' && nextArgs?.UPDATE_ITEM?.itemId) {
        await ctx.scheduler.runAfter(0, internal.router.items.replaceImage._internal, {
          imageId: image[0]._id,
          itemId: nextArgs.UPDATE_ITEM.itemId,
        });
      }
    }
  }
})

export const runpodRemoveBackgroundHandler = httpAction(async (ctx, request) => {
  // Handle the Replicate webhook request here
  const json = await request.json();

  const body = RemoveBackgroundTaskSchema.parse(json);

  if (!body.output) {
    return Response.json({ received: true }, { status: 200 });
  }

  const callback = body.output.callback;
  const userId = callback.userId as Id<'users'>;

  await ctx.scheduler.runAfter(0, internal.http.runpod.removeBackground._internal_process, {
    removeBackgroundData: {
      url: body.output.url,
      callback: {
        userId,
        nextStep: callback.nextStep,
        nextArgs: callback.nextArgs?.CREATE_ITEM ? {
          CREATE_ITEM: {
            name: callback.nextArgs.CREATE_ITEM?.name,
            description: callback.nextArgs.CREATE_ITEM?.description,
            itemUrl: callback.nextArgs.CREATE_ITEM?.itemUrl,
            brand: callback.nextArgs.CREATE_ITEM?.brand,
            gender: callback.nextArgs.CREATE_ITEM?.gender,
            fit: callback.nextArgs.CREATE_ITEM?.fit,
            materials: callback.nextArgs.CREATE_ITEM?.materials,
            price: callback.nextArgs.CREATE_ITEM?.price,
            sku: callback.nextArgs.CREATE_ITEM?.sku,
          }
        } : callback.nextArgs?.UPDATE_ITEM ? {
          UPDATE_ITEM: {
            itemId: callback.nextArgs.UPDATE_ITEM.itemId as Id<'items'>,
          }
        } : undefined,
      },
    }
  })

  return Response.json({ received: true }, { status: 200 });
})