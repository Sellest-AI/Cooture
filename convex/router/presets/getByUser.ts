import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { sanitizePresets } from "../../functions/presets";
import { authQuery, publicQuery, QueryCtx } from "../../procedures";

const getPresetsFromUser = async (ctx: QueryCtx, userId: Id<'users'>, includeArchived: boolean) => {
  const presets = await ctx.db.query('presets')
    .withIndex('by_user_id', q => q.eq('userId', userId))
    .order('desc').collect();

  const filteredPresets = includeArchived ?
    presets : presets.filter((p) => !p.archived)

  // Sanitize presets by removing prompts
  const sanitizedPresets = await sanitizePresets(ctx, filteredPresets);

  return sanitizedPresets;
}

export const anon = publicQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return getPresetsFromUser(ctx, userId, false);
  }
})

export const authed = authQuery({
  args: {
    userId: v.id("users"),
    includeArchived: v.boolean(),
  },
  handler: async (ctx, { userId, includeArchived }) => {
    return getPresetsFromUser(ctx, userId, includeArchived);
  }
})