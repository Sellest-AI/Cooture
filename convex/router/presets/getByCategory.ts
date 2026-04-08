import { notEmpty } from "@shared/utils";
import { Doc, Id } from "../../_generated/dataModel";
import { sanitizePresets } from "../../functions/presets";
import { authQuery, publicQuery, QueryCtx } from "../../procedures";
import { PRESET_CATEGORIES, PresetCategory } from "../../schema/presets";

type Args = {
  category: PresetCategory;
  userId?: Id<'users'>;
  limit: number;
}

const handler = async (ctx: QueryCtx, args: Args) => {
  const categories = ctx.db.query('presetCategories')
    .withIndex('by_name_score', (q) => q.eq("name", args.category).gte("score", 0.6))

  let totalCount = 0;
  const presets: (Doc<'presets'> & { score: number })[] = [];

  for await (const category of categories) {
    const preset = await ctx.db.get(category.presetId);
    if (!preset) continue;
    // Skip user-generated presets if no userId is provided
    if (args.userId === undefined && preset.userId) continue;
    // If userId is provided, only include presets created by that user
    if (args.userId && preset.userId !== args.userId) continue;

    presets.push({ ...preset, score: category.score });

    totalCount++;
    if (totalCount >= args.limit) break; // Limit to the specified number of presets per category
  }

  const sanitizedPresets = await sanitizePresets(ctx, presets
    .sort((a, b) => b.score - a.score) // Sort by category score
    .filter(notEmpty));

  return sanitizedPresets.filter(notEmpty);
}

export const anon = publicQuery({
  args: {
    category: PRESET_CATEGORIES,
  },
  handler: async (ctx, args) => {
    return handler(ctx, { ...args, limit: 32 });
  }
})

export const authed = authQuery({
  args: {
    category: PRESET_CATEGORIES,
  },
  handler: async (ctx, args) => {
    return handler(ctx, { ...args, userId: ctx.userId, limit: 32 });
  }
})