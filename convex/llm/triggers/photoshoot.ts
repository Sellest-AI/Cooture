"use node"
import { predictImage } from "@/lib/kie/node";
import { sliceText } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Doc, Id } from "../../_generated/dataModel";
import { CREDITS_CONFIG } from "../../functions/credits";
import { withReservedCredits } from "../../functions/credits/withReservedCredits";
import { ActionCtx, adminAction, authAction } from "../../procedures";
import { createPhotoshootSchema, schemaToMarkdown } from "../utils/photoshoot";
import { assertGenerationOwner, parseNumberToGenerate } from "../utils/photoshoot/guards";

const OUTFIT_SIZES_ARGS = v.union(v.literal("TIGHT"), v.literal("DEFAULT"), v.literal("LOOSE"), v.literal("EXTRA_LOOSE"));

const generateFunction = async (ctx: ActionCtx, args: {
  userId: Id<'users'>,
  generationId?: Id<'generations'>,
  presetId: Id<'presets'>,
  outfit?: { _id: Id<'outfits'>, size?: "TIGHT" | "DEFAULT" | "LOOSE" | "EXTRA_LOOSE", shared?: boolean },
  extraUserIds?: Id<'users'>[],
  numberToGenerate?: number,
}) => {
  const NUMBER_OF_IMAGES = parseNumberToGenerate(args.numberToGenerate);
  const COST = CREDITS_CONFIG.COST_PER_IMAGE_GENERATION * NUMBER_OF_IMAGES;

  // 1. Authorise before anything is charged or started
  await assertGenerationOwner(ctx, args.userId, args.generationId);

  // 2. Charge up front — the reservation is refunded if the generation cannot be started
  return withReservedCredits(ctx, { userId: args.userId, amount: COST }, async () => {
    const preset = await ctx.runQuery(internal.router.presets.getOne._internal, { presetId: args.presetId });
    if (!preset) throw new Error("Preset not found");

    const baseSchema = {
      prompt: preset.prompts[0],
      depthMap: preset.depthMaps[0]
    }

    const subjects = [{ userId: args.userId, outfit: args.outfit },
    ...(args.extraUserIds ?? []).map((id) => ({ userId: id, outfit: args.outfit?.shared ? args.outfit : undefined }))
    ].map((subject, i) => ({ ...subject, prompt: baseSchema.prompt.subjects[i] }))

    const schema = await createPhotoshootSchema(ctx, baseSchema, subjects);
    const prompt = await schemaToMarkdown(schema.prompt);

    // only add extra users to generation, not the main user
    const extraUsers = Array.from(new Set(subjects.map(s => s.userId)))
      .filter(id => id !== args.userId).slice(0, schema.prompt.subjects.length - 1);

    // seedream 4.5 has a max prompt length of 3000 characters, 
    // so we need to shrink the prompt if it's too long
    const shrinkedPrompt = sliceText(prompt, 3000);

    const predictions = await Promise.all(Array.from({ length: NUMBER_OF_IMAGES }).map(async () => predictImage({
      model: 'bytedance/seedream-4.5',
      images: schema.images,
      prompt: shrinkedPrompt,
    })));

    return args.generationId ?
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
  });
}

const provisionCreditsForGeneration = async (ctx: ActionCtx & { userId: Id<'users'>, user: { role: Doc<'usersExtended'>['role'] } },
  args: { numberToGenerate?: number, userId: Id<'users'> }) => {
  if (ctx.user.role === 'ADMIN' || ctx.user.role === 'BOT') {
    await ctx.runMutation(internal.router.credits.grantCredits._internal, {
      amount: CREDITS_CONFIG.COST_PER_IMAGE_GENERATION * parseNumberToGenerate(args.numberToGenerate),
      userId: args.userId,
      metadata: ctx.user.role === 'ADMIN' ? {
        reason: "Admin grant for photoshoot generation",
        adminId: ctx.userId,
      } : {
        reason: "System grant for photoshoot generation",
      }
    });
  }
}

const sharedArgs = {
  generationId: v.optional(v.id("generations")),
  presetId: v.id("presets"),
  outfit: v.optional(v.object({
    _id: v.id("outfits"),
    size: v.optional(OUTFIT_SIZES_ARGS),
    shared: v.optional(v.boolean())
  })),
  /** Other users to be added when duo/trio shot */
  extraUserIds: v.optional(v.array(v.id("users"))),
  numberToGenerate: v.optional(v.number())
}

export const authed = authAction({
  args: sharedArgs,
  handler: async (ctx, args): Promise<Id<'generations'>> => {
    await provisionCreditsForGeneration(ctx, {
      userId: ctx.userId,
      numberToGenerate: args.numberToGenerate
    });

    return generateFunction(ctx, {
      ...args,
      userId: ctx.userId,
    })
  }
})

export const admin = adminAction({
  args: { ...sharedArgs, userId: v.id("users") },
  handler: async (ctx, args): Promise<Id<'generations'>> => {
    await provisionCreditsForGeneration(ctx, {
      userId: args.userId,
      numberToGenerate: args.numberToGenerate
    });

    return generateFunction(ctx, args);
  },
})