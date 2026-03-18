import { notEmpty } from "@shared/utils";
import { paginationOptsValidator } from "convex/server";
import { Infer, v } from "convex/values";
import { getItem } from "../../functions/items/getItem";
import { adminQuery, authQuery, QueryCtx } from "../../procedures";

const args = {
  paginationOpts: paginationOptsValidator,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const argsObject = v.object({ ...args, userId: v.id("users") });
type Args = Infer<typeof argsObject>;

const handler = async (ctx: QueryCtx, args: Args) => {
  const results = await ctx.db.query("items")
    .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
    .order("desc")
    .paginate(args.paginationOpts);

  const items = await Promise.all(results.page.map(async (item) => getItem(ctx, item._id)))

  return {
    ...results,
    page: items.filter(notEmpty)
  }
}

export const authed = authQuery({
  args,
  handler: async (ctx, args) => handler(ctx, { ...args, userId: ctx.userId })
})

export const admin = adminQuery({
  args: { ...args, userId: v.id("users") },
  handler: async (ctx, args) => handler(ctx, args)
})