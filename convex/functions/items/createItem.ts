import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ActionCtx } from "../../procedures";
import { CREDITS_CONFIG } from "../credits";

type Args = {
  imageId: Id<"images">;
  userId: Id<"users">;
  metadata?: {
    brand?: string;
    name?: string;
    description?: string;
    itemUrl?: string;
  }
}

export const createItem = async (ctx: ActionCtx, data: Args): Promise<Id<"items">> => {
  const schema = await ctx.runAction(internal.llm.triggers.itemCategorizer._internal, {
    imageId: data.imageId,
    userId: data.userId,
    extractText: true,
    metadata: data.metadata ? {
      brand: data.metadata.brand,
      name: data.metadata.name,
      description: data.metadata.description,
    } : undefined,
  })

  const item = await ctx.runMutation(internal.router.items.createOne._internal_mutation, {
    ...schema,
    userId: data.userId,
    name: schema.name || 'Untitled Item',
    description: schema.description || undefined,
    mainColors: schema.mainColors,
    imageId: data.imageId,
    link: data.metadata?.itemUrl,
  });

  await ctx.runMutation(internal.router.credits.deductCredits._internal, {
    userId: data.userId,
    amount: CREDITS_CONFIG.COST_PER_ITEM,
  }).catch(() => null);

  return item;
}