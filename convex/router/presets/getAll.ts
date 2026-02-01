import { notEmpty } from "@shared/utils";
import { getImage } from "../../functions/images";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {},
  handler: async (ctx) => {
    const presets = await ctx.db.query('presets').collect();
    // Sanitize presets by removing prompts
    const sanitizedPresets = await Promise.all(presets.map(async ({ prompts, ...rest }) => {
      const cover = await getImage(ctx, rest.imageIds[0]);
      if (!cover) return null;
      return {
        ...rest,
        expectedResults: prompts.length,
        cover,
      }
    }));

    return sanitizedPresets.filter(notEmpty);
  }
})