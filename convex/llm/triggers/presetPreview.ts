"use node"
import { parseReplicateRunOutput, runImage } from "@/lib/replicate/node";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { isPremium } from "../../functions/users";
import { authAction } from "../../procedures";
import { createPhotoshootSchema, schemaToMarkdown } from "../utils/photoshoot";

export const authed = authAction({
  args: {
    presetId: v.id("presets"),
    numberOfImages: v.optional(v.union(v.literal(1), v.literal(2), v.literal(3))),
  },
  handler: async (ctx, args): Promise<string[]> => {
    await isPremium(ctx, { throwOnReject: true });

    const preset = await ctx.runQuery(internal.router.presets.getOne._internal, { presetId: args.presetId });
    if (!preset) throw new Error("Preset not found");

    const baseSchema = {
      prompt: preset.prompts[0],
      depthMap: preset.depthMaps[0]
    }

    const subjects = baseSchema.prompt.subjects.map((prompt) => ({
      userId: undefined,
      prompt: prompt,
    }))

    const schema = await createPhotoshootSchema(ctx, baseSchema, subjects);
    const prompt = await schemaToMarkdown(schema.prompt);

    const numberOfImages = args.numberOfImages || 3;

    const runs = await Promise.all(Array.from({ length: numberOfImages }).map(async () => runImage({
      model: 'prunaai/z-image-turbo',
      height: 768,
      width: 512,
      prompt,
    })));

    const outputs = await Promise.all(runs.map(parseReplicateRunOutput));
    const urls = await Promise.all(outputs.map(output => output.map((o) => o.toUrl())).flat());

    return urls;
  }
})