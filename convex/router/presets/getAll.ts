import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { getImage } from "../../functions/images";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    /** Number between 0 and 23 */
    seed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const presets = await ctx.db.query('presets')
      .withIndex('by_archived', (q) => q.eq("archived", false))
      .order('desc').collect();

    // Sanitize presets by removing prompts
    const sanitizedPresets = await Promise.all(presets.map(async ({ prompts, ...rest }) => {
      const hasMultipleSubjects = prompts.some((p) => p.subjects.length > 1);
      const cover = await getImage(ctx, rest.imageIds[0]);
      if (!cover) return null;
      return {
        ...rest,
        expectedResults: prompts.length,
        hasMultipleSubjects,
        cover,
      }
    }));

    return sanitizedPresets
      .filter(notEmpty)
      .sort((a, b) => {
        // Add some randomness to the order based on the seed
        if (args.seed === undefined) return 0;
        const aScore = parseInt(a._id, 16) + args.seed;
        const bScore = parseInt(b._id, 16) + args.seed;
        return aScore - bScore;
      });
  }
})