import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { Doc, Id } from "../../_generated/dataModel";
import { getImage, GetImageDoc } from "../../functions/images";
import { authQuery, publicQuery, QueryCtx } from "../../procedures";

const handler = async (ctx: QueryCtx, args: { query: string, userId?: Id<'users'> }) => {
  const results = await ctx.db.query("presets")
    .withSearchIndex("search_name", (q) => q.search("name", args.query))
    .filter(q => q.eq(q.field('userId'), args.userId))
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
      if (preset.archived) return null;

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

type Result = (Omit<Doc<'presets'>, 'prompts'> & {
  hasMultipleSubjects: boolean;
  cover: NonNullable<GetImageDoc>;
})[]

export const anon = publicQuery({
  args: { query: v.string() },
  handler: async (ctx, args): Promise<Result> => { return handler(ctx, { query: args.query }); }
})

export const authed = authQuery({
  args: { query: v.string() },
  handler: async (ctx, args): Promise<Result> => { return handler(ctx, { userId: ctx.userId, query: args.query }); }
})