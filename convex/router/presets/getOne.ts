import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getImage } from "../../functions/images";
import { internalQuery, publicQuery, QueryCtx } from "../../procedures";

const getPreset = async (ctx: QueryCtx, presetId: Id<'presets'>) => {
  const preset = await ctx.db.get(presetId);
  if (!preset) return null;
  const cover = await getImage(ctx, preset.imageIds[0]);
  return { ...preset, cover };
}

export const anon = publicQuery({
  args: {
    presetId: v.id("presets"),
  },
  handler: async (ctx, { presetId }) => {
    const preset = await getPreset(ctx, presetId);
    if (!preset) return null;
    const { prompts, ...rest } = preset;

    // Sanitize preset by removing prompts
    return {
      ...rest,
      expectedResults: prompts.length,
    };
  }
})

export const _internal = internalQuery({
  args: {
    presetId: v.id("presets"),
  },
  handler: async (ctx, { presetId }) => {
    return getPreset(ctx, presetId);
  }
})