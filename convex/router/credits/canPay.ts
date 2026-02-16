import { v } from "convex/values";
import { getUserWallet } from "../../functions/credits";
import { internalQuery } from "../../procedures";

export const _internal = internalQuery({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const wallet = await getUserWallet(ctx, args.userId);
    const canPay = wallet.credits >= args.amount;
    return canPay;
  }
})