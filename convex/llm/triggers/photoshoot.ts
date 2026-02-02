"use node";
import { predictImage } from "@/lib/replicate/node";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { authAction } from "../../procedures";

export const authed = authAction({
  args: {
    presetId: v.id("presets"),
    outfitId: v.optional(v.id("outfits")),
  },
  handler: async (ctx, args): Promise<Id<'generations'>> => {
    const portraits = await ctx.runQuery(internal.router.users.getPortraits._internal, { userId: ctx.userId });
    if (!portraits) throw new Error("User portraits not found");

    const preset = await ctx.runQuery(internal.router.presets.getOne._internal, { presetId: args.presetId });
    if (!preset) throw new Error("Preset not found");

    const REFERENCE = "Use the subject's front portrait from the reference image. But only use it to capture the subject's face and skin tone. Do not copy facial expression.";

    const _prompt = preset.prompts[0];
    const prompt = {
      ..._prompt,
      subject: {
        ..._prompt.subject,
        reference: REFERENCE,
      }
    }

    const AMOUNT_OF_IMAGES = 3;

    const side = prompt.subject.head.direction === "front" ? portraits.frontImage : portraits.sideImage;

    const predictions = await Promise.all(Array.from({ length: AMOUNT_OF_IMAGES }).map(async () => predictImage({
      model: 'bytedance/seedream-4.5',
      images: [{ url: side.url, hasAlpha: side?.hasAlpha }],
      prompt: JSON.stringify(prompt),
    })));

    const generationId = await ctx.runMutation(internal.router.generations.createOne._internal, {
      userId: ctx.userId,
      predictionIds: predictions.map(p => p.id),
      preset: {
        presetId: preset._id,
        prompts: [JSON.stringify(prompt)],
      }
    })

    return generationId;
  }
})