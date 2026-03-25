import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { sanitizePresets } from "../../functions/presets";
import { publicQuery } from "../../procedures";
import { PRESET_CATEGORIES } from "../../schema/presets";

export const anon = publicQuery({
  args: {
    category: PRESET_CATEGORIES,
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db.query('presetCategories')
      .withIndex('by_name_score', (q) => q.eq("name", args.category).gte("score", 0.6))
      .paginate(args.paginationOpts);

    // Sanitize presets by removing prompts
    const presets = await Promise.all(categories.page
      .sort((a, b) => b.score - a.score) // Sort by category score
      .map(async (categories) => {
        const preset = await ctx.db.get(categories.presetId);
        if (!preset) return null;
        return preset;
      }));

    const sanitizedPresets = await sanitizePresets(ctx, presets.filter(notEmpty));

    const page = sanitizedPresets.filter(notEmpty);

    return {
      ...categories,
      page
    }
  }
})