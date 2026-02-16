import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { getUserWallet } from "../../functions/credits";
import { authQuery, internalQuery, QueryCtx } from "../../procedures";

const canPay = async (ctx: QueryCtx, userId: Id<"users">, amount: number) => {
  const wallet = await getUserWallet(ctx, userId);
  const canPay = wallet.credits >= amount;
  return canPay;
}

export const _internal = internalQuery({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    return await canPay(ctx, args.userId, args.amount);
  }
})


export const authed = authQuery({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    return await canPay(ctx, ctx.userId, args.amount);
  }
})