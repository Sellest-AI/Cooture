"use node"
import { predictImage } from "@/lib/replicate/node";
import { sliceText } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { CREDITS_CONFIG } from "../../functions/credits";
import { authAction } from "../../procedures";
import { createPhotoshootSchema, schemaToMarkdown } from "../utils/photoshoot";

const OUTFIT_SIZES_ARGS = v.union(v.literal("TIGHT"), v.literal("DEFAULT"), v.literal("LOOSE"), v.literal("EXTRA_LOOSE"));

export const authed = authAction({
  args: {
    presetId: v.id("presets"),
    outfit: v.optional(v.object({
      _id: v.id("outfits"),
      size: v.optional(OUTFIT_SIZES_ARGS),
    })),
    /** Other users to be added when duo/trio shot */
    extraUserIds: v.optional(v.array(v.id("users"))),
    numberToGenerate: v.optional(v.number())
  },
  handler: async (ctx, args): Promise<Id<'generations'>> => {
    const AMOUNT_OF_IMAGES = args.numberToGenerate ?? 1;
    const COST = CREDITS_CONFIG.COST_PER_GENERATION * AMOUNT_OF_IMAGES;

    // 1. Check if can pay
    const canPay = await ctx.runQuery(internal.router.credits.canPay._internal, {
      userId: ctx.userId,
      amount: COST,
    });

    if (!canPay) throw new Error("Not enough credits to start generation.");

    // 2. Proceed with generation
    const preset = await ctx.runQuery(internal.router.presets.getOne._internal, { presetId: args.presetId });
    if (!preset) throw new Error("Preset not found");

    const baseSchema = {
      prompt: preset.prompts[0],
      depthMap: preset.depthMaps[0]
    }

    const subjects = [{ userId: ctx.userId, outfit: args.outfit },
    ...(args.extraUserIds ?? []).map((id) => ({ userId: id }))
    ].map((subject, i) => ({ ...subject, prompt: baseSchema.prompt.subjects[i] }))

    const schema = await createPhotoshootSchema(ctx, baseSchema, subjects);
    const prompt = await schemaToMarkdown(schema.prompt);

    // seedream 4.5 has a max prompt length of 2000 characters, 
    // so we need to shrink the prompt if it's too long
    const shrinkedPrompt = sliceText(prompt, 2000);

    const predictions = await Promise.all(Array.from({ length: AMOUNT_OF_IMAGES }).map(async () => predictImage({
      model: 'bytedance/seedream-4.5',
      images: schema.images,
      prompt: shrinkedPrompt,
    })));

    const generationId = await ctx.runMutation(internal.router.generations.createOne._internal, {
      userId: ctx.userId,
      extraUserIds: subjects.map(s => s.userId),
      predictionIds: predictions.map(p => p.id),
      preset: {
        presetId: preset._id,
        outfitId: args.outfit?._id,
        prompts: [JSON.stringify(schema.prompt), prompt],
      }
    })

    // 3. Update transaction with generationId (optional - for better tracking)
    await ctx.runMutation(internal.router.credits.deductCredits._internal, {
      amount: CREDITS_CONFIG.COST_PER_GENERATION * AMOUNT_OF_IMAGES,
      userId: ctx.userId,
      generationId,
    });

    return generationId;
  }
})