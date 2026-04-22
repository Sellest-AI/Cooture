"use node"
import { predictImage } from "@/lib/replicate/node";
import { sliceText } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { CREDITS_CONFIG } from "../../functions/credits";
import { ActionCtx, adminAction, authAction } from "../../procedures";
import { createPhotoshootSchema, schemaToMarkdown } from "../utils/photoshoot";

const OUTFIT_SIZES_ARGS = v.union(v.literal("TIGHT"), v.literal("DEFAULT"), v.literal("LOOSE"), v.literal("EXTRA_LOOSE"));

const generateFunction = async (ctx: ActionCtx, args: {
  userId: Id<'users'>,
  generationId?: Id<'generations'>,
  presetId: Id<'presets'>,
  outfit?: { _id: Id<'outfits'>, size?: "TIGHT" | "DEFAULT" | "LOOSE" | "EXTRA_LOOSE", },
  extraUserIds?: Id<'users'>[],
  numberToGenerate?: number,
}) => {
  const NUMBER_OF_IMAGES = args.numberToGenerate ?? 1;
  const COST = CREDITS_CONFIG.COST_PER_IMAGE_GENERATION * NUMBER_OF_IMAGES;

  // 1. Check if can pay
  const canPay = await ctx.runQuery(internal.router.credits.canPay._internal, {
    userId: args.userId,
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

  const subjects = [{ userId: args.userId, outfit: args.outfit },
  ...(args.extraUserIds ?? []).map((id) => ({ userId: id }))
  ].map((subject, i) => ({ ...subject, prompt: baseSchema.prompt.subjects[i] }))

  const schema = await createPhotoshootSchema(ctx, baseSchema, subjects);
  const prompt = await schemaToMarkdown(schema.prompt);

  // only add extra users to generation, not the main user
  const extraUsers = Array.from(new Set(subjects.map(s => s.userId)))
    .filter(id => id !== args.userId).slice(0, schema.prompt.subjects.length - 1);

  // seedream 4.5 has a max prompt length of 5000 characters, 
  // so we need to shrink the prompt if it's too long
  const shrinkedPrompt = sliceText(prompt, 5000);

  const predictions = await Promise.all(Array.from({ length: NUMBER_OF_IMAGES }).map(async () => predictImage({
    model: 'bytedance/seedream-4.5',
    images: schema.images,
    prompt: shrinkedPrompt,
  })));

  const generationId = args.generationId ?
    // Add new predictions to existing generation (for multi-step photoshoot)
    await ctx.runMutation(internal.router.generations.newPredictions._internal, {
      generationId: args.generationId,
      predictions: predictions.map(p => ({ id: p.id })),
    }) :
    // Create new generation
    await ctx.runMutation(internal.router.generations.createOne._internal, {
      userId: args.userId,
      extraUserIds: extraUsers,
      predictions: predictions.map(p => ({ id: p.id })),
      preset: {
        presetId: preset._id,
        outfitId: args.outfit?._id,
        prompts: [JSON.stringify(schema.prompt), prompt],
      }
    })

  // 3. Update transaction with generationId (optional - for better tracking)
  await ctx.runMutation(internal.router.credits.deductCredits._internal, {
    amount: COST,
    userId: args.userId,
    generationId,
  }).catch(() => null);

  return generationId;
}

const sharedArgs = {
  generationId: v.optional(v.id("generations")),
  presetId: v.id("presets"),
  outfit: v.optional(v.object({
    _id: v.id("outfits"),
    size: v.optional(OUTFIT_SIZES_ARGS),
  })),
  /** Other users to be added when duo/trio shot */
  extraUserIds: v.optional(v.array(v.id("users"))),
  numberToGenerate: v.optional(v.number())
}

export const authed = authAction({
  args: sharedArgs,
  handler: async (ctx, args): Promise<Id<'generations'>> => generateFunction(ctx, {
    ...args,
    userId: ctx.userId,
  }),
})

export const admin = adminAction({
  args: { ...sharedArgs, userId: v.id("users") },
  handler: async (ctx, args): Promise<Id<'generations'>> => {
    await ctx.runMutation(internal.router.credits.grantCredits._internal, {
      amount: CREDITS_CONFIG.COST_PER_IMAGE_GENERATION * (args.numberToGenerate ?? 1),
      userId: args.userId,
      metadata: {
        reason: "Admin grant for photoshoot generation",
        adminId: ctx.userId,
      }
    });

    return generateFunction(ctx, args);
  },
})