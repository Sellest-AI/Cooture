"use node"
import { generateVideo } from "@/lib/runpod/generateVideo";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { internalAction } from "../../_generated/server";
import { CREDITS_CONFIG } from "../../functions/credits";

export const _internal = internalAction({
  args: {
    predictionId: v.id("predictions"),
  },
  handler: async (ctx, args): Promise<Id<'generations'>> => {
    const generation = await ctx.runQuery(internal.router.generations.getFromPrediction._internal, { id: args.predictionId });
    if (!generation) throw new Error("Generation not found");

    const COST = CREDITS_CONFIG.COST_PER_VIDEO_GENERATION;
    const userId = generation.userId;

    // 1. Check if can pay
    const canPay = await ctx.runQuery(internal.router.credits.canPay._internal, {
      userId: userId,
      amount: COST,
    });

    if (!canPay) throw new Error("Not enough credits to start video generation.");

    const imageId = generation.predictions.find(p => p._id === args.predictionId)?.imageId;
    if (!imageId) throw new Error("Image not found for prediction");

    const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
    if (!image) throw new Error("Image not found");

    const prompt = "Make the scene alive";

    const run = await generateVideo({
      imageUrl: image.url,
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
    const generationId = await ctx.runMutation(internal.router.generations.createOne._internal, {
      userId: userId,
      extraUserIds: generation.userIds,
      predictions: [{
        id: run.id,
        baseImageId: imageId,
      }],
      preset,
    });

    // Deduct credits
    await ctx.runMutation(internal.router.credits.deductCredits._internal, {
      amount: COST,
      userId: userId,
      generationId,
    }).catch(() => null);

    return generationId;
  }
})