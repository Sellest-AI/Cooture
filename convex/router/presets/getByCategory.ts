import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { getImage } from "../../functions/images";
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
    const sanitizedPresets = await Promise.all(categories.page.map(async (categories) => {
      const preset = await ctx.db.get(categories.presetId);
      if (!preset) return null;
      const cover = await getImage(ctx, preset.imageIds[0]);
      if (!cover) return null;

      const { prompts, ...rest } = preset;
      const hasMultipleSubjects = prompts.some((p) => p.subjects.length > 1);

      return {
        ...rest,
        expectedResults: preset.prompts.length,
        hasMultipleSubjects,
        cover,
      }
    }));

    const page = sanitizedPresets.filter(notEmpty);

    return {
      ...categories,
      page
    }
  }
})