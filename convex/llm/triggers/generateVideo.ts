"use node"
import { generateVideo } from "@/lib/runpod/generateVideo";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Doc, Id } from "../../_generated/dataModel";
import { ActionCtx, internalAction } from "../../_generated/server";
import { CREDITS_CONFIG } from "../../functions/credits";
import { authAction } from "../../procedures";
import { videoPrompter } from "../tools/videoPrompter";

type Generation = Doc<'generations'> & {
  presetId?: Id<'presets'>;
  outfitId?: Id<'outfits'>;
  userIds?: Id<'users'>[];
  predictions: Doc<'predictions'>[];
}

type Args = {
  predictionId: Id<'predictions'>;
  generation: Generation;
  // If true, will create a new generation instead of adding to the existing one
  newGeneration?: boolean;
}

export const handler = async (ctx: ActionCtx, { generation, predictionId, newGeneration }: Args) => {
  if (!generation.predictions.find(p => p._id === predictionId))
    throw new Error("Prediction not found in generation");

  const COST = CREDITS_CONFIG.COST_PER_VIDEO_GENERATION;
  const userId = generation.userId;

  // 1. Check if can pay
  const canPay = await ctx.runQuery(internal.router.credits.canPay._internal, {
    userId: userId,
    amount: COST,
  });

  if (!canPay) throw new Error("Not enough credits to start video generation.");

  const imageId = generation.predictions.find(p => p._id === predictionId)?.imageId;
  if (!imageId) throw new Error("Image not found for prediction");

  const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
  if (!image) throw new Error("Image not found");

  const prompt = await videoPrompter.handler({ ...ctx }, { imageUrl: image.sizes.large.url });

  const run = await generateVideo({
    imageUrl: image.url,
    imageId: image._id,
    durationMs: 4 * 1000,
    prompt,
    callback: {
      userId: userId,
      baseImageId: undefined,
    }
  });

  const preset = generation.presetId ? {
    presetId: generation.presetId,
    outfitId: generation.outfitId,
    prompts: [prompt],
  } : undefined;

  // Duplicate previous generation with new prediction, so it appears in the UI and can be tracked
  const generationId =
    newGeneration ? await ctx.runMutation(internal.router.generations.createOne._internal, {
      userId: userId,
      extraUserIds: generation.userIds,
      predictions: [{
        id: run.id,
        baseImageId: imageId,
      }],
      preset,
    }) : await ctx.runMutation(internal.router.generations.newPredictions._internal, {
      generationId: generation._id,
      predictions: [{
        id: run.id,
        baseImageId: imageId,
      }],
    });

  // Deduct credits
  await ctx.runMutation(internal.router.credits.deductCredits._internal, {
    amount: COST,
    userId: userId,
    generationId,
  }).catch(() => null);

  return generationId;
}

export const _internal = internalAction({
  args: {
    predictionId: v.id("predictions"),
    newGeneration: v.optional(v.boolean()),
  },
  handler: async (ctx, { predictionId, newGeneration }): Promise<Id<'generations'>> => {
    const generation = await ctx.runQuery(internal.router.generations.getFromPrediction._internal, { id: predictionId });
    if (!generation) throw new Error("Generation not found");

    return await handler(ctx, { generation, predictionId, newGeneration });
  }
})

export const authed = authAction({
  args: {
    predictionId: v.id("predictions"),
  },
  handler: async (ctx, { predictionId }): Promise<Id<'generations'>> => {
    const generation = await ctx.runQuery(internal.router.generations.getFromPrediction._internal, { id: predictionId });
    if (!generation) throw new Error("Generation not found");

    if (generation.userId !== ctx.userId)
      throw new Error("Not authorized to generate video for this prediction");

    const newGeneration = generation.isVideosOnly ? false : true;

    return await handler(ctx, { generation, predictionId, newGeneration });
  }
})