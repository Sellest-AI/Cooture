import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { trendExtractor } from "../tools/trendExtractor";

type Result = {
  trend: string;
  confidence: number;
}[];

export const _internal = internalAction({
  args: {
    items: v.array(v.object({
      name: v.string(),
      brand: v.optional(v.string()),
      description: v.optional(v.string()),
      features: v.optional(v.array(v.string())),
      category: v.string(),
      weatherTags: v.array(v.string()),
      mainColors: v.array(v.string()),
      colorTones: v.array(v.string()),
      materialFeel: v.string(),
      materials: v.array(v.string()),
      styles: v.optional(v.array(v.string())),
    }))
  },
  handler: async (ctx, args): Promise<Result> => {
    const toolCtx = {
      runQuery: ctx.runQuery,
      runMutation: ctx.runMutation,
      scheduler: ctx.scheduler,
      runAction: ctx.runAction,
      auth: ctx.auth,
      storage: ctx.storage,
      vectorSearch: ctx.vectorSearch,
      userId: undefined,
      meta: ctx.meta,
    }

    const trends = await trendExtractor.handler(toolCtx, {
      itemsData: args.items
    });

    return trends.map((trend) => ({
      trend: trend.name,
      confidence: trend.confidence,
    }));
  }
})