import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { Doc } from "../../_generated/dataModel";
import { getImage, GetImageDoc } from "../../functions/images";
import { publicQuery } from "../../procedures";

type Result = (Omit<Doc<'presets'>, 'prompts'> & {
  hasMultipleSubjects: boolean;
  cover: NonNullable<GetImageDoc>;
})[]

export const anon = publicQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<Result> => {
    const results = await ctx.db.query("presets")
      .withSearchIndex("search_name", (q) => q.search("name", args.query))
      .take(20);

    const categories = await ctx.runQuery(api.router.presets.getCategories.anon);

    // filter categories that match the query
    const matchingCategories =
      categories.filter(category => category.value.toLowerCase().includes(args.query.toLowerCase()));

    const matchingPresetIds = await Promise.all(matchingCategories.map((c) =>
      ctx.db.query("presetCategories").withIndex("by_name_score", (q) => q.eq("name", c.value).gte("score", 0.6)).take(5)))

    const matchingPresets = (await Promise.all(Array.from(new Set(matchingPresetIds.flat().map((pc) => pc.presetId)))
      .map(async (id) => ctx.db.get(id)))).filter(notEmpty);

    const presetIds = Array.from(new Set([...results.map(r => r._id), ...matchingPresets.map(p => p._id)]));

    return (await Promise.all(presetIds.map((id) => results.find(r => r._id === id) ?? matchingPresets.find(p => p._id === id))
      .filter(notEmpty).map(async (preset) => {
        const cover = await getImage(ctx, preset.imageIds[0]);
        if (!cover) return null;

        const { prompts, ...rest } = preset;
        const hasMultipleSubjects = prompts.some((p) => p.subjects.length > 1);

        return {
          ...rest,
          hasMultipleSubjects,
          cover,
        }
      }))).filter(notEmpty);
  }
})