import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {},
  handler: async (ctx) => {
    const presets = await ctx.db.query('presets').collect();
    // Sanitize presets by removing prompts
    return presets.map(({ prompts, ...rest }) => ({
      ...rest,
      expectedResults: prompts.length,
    }));
  }
})