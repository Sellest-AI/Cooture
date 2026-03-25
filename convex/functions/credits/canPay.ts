import { api, internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ActionCtx, MutationCtx } from "../../procedures";

type Ctx = (ActionCtx | MutationCtx) & { userId: Id<'users'> | null };
type Options = {
  throwOnReject?: boolean;
}

type Type = "GENERATION_COST" | "ITEM_CREATION_COST" | "PRESET_CREATION_COST";
type Args = {
  type: Type;
  amount?: number;
}

export const canPay = async (ctx: Ctx, args: Args, options?: Options): Promise<boolean> => {
  const userId = ctx.userId;
  const throwOnReject = options?.throwOnReject ?? true;

  if (!userId) {
    if (throwOnReject) throw new Error("User not authenticated");
    return false;
  }

  const cost = await ctx.runQuery(api.router.credits.getCost.anon, {
    type: args.type,
    amount: args.amount,
  });

  const result = await ctx.runQuery(internal.router.credits.canPay._internal, {
    userId,
    amount: cost,
  });

  return result;
}