import { internal } from "../../_generated/api";
import { QueryCtx } from "../../procedures";

type Ctx = Pick<QueryCtx, 'runQuery'>

export const getItemFromSku = async (ctx: Ctx, sku: string) => {
  return ctx.runQuery(internal.router.items.getFromSku._internal, {
    sku: sku,
  })
}