import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { convertTagsToString } from "../../lib/helpers";
import { ActionCtx } from "../../procedures";
import { CREDITS_CONFIG } from "../credits";

type Args = {
  imageId: Id<"images">;
  userId: Id<"users">;
  metadata?: {
    brand?: string;
    name?: string;
    description?: string;
    gender?: string;
    fit?: string;
    materials?: string[];
    itemUrl?: string;
  }
}

export const createItem = async (ctx: ActionCtx, data: Args): Promise<Id<"items">> => {
  const schema = await ctx.runAction(internal.llm.triggers.itemCategorizer._internal, {
    imageId: data.imageId,
    extractText: true,
    metadata: data.metadata ? {
      brand: data.metadata.brand,
      name: data.metadata.name,
      description: data.metadata.description,
      url: data.metadata.itemUrl,
      gender: data.metadata.gender,
      fit: data.metadata.fit,
      materials: data.metadata.materials,
    } : undefined,
  })

  const mainColors = schema.mainColors.map((c) => c.hex);
  const colorTags = convertTagsToString(schema.colorTags);
  const brand = (schema.brand?.toLowerCase() === 'unknown' || schema.brand?.trim().length === 0)
    ? undefined : schema.brand;

  const item = await ctx.runMutation(internal.router.items.createOne._internal_mutation, {
    ...schema,
    brand,
    userId: data.userId,
    name: schema.name || 'Untitled Item',
    description: schema.description || undefined,
    mainColors: mainColors,
    colorTags: colorTags,
    imageId: data.imageId,
    link: data.metadata?.itemUrl,
  });

  await ctx.scheduler.runAfter(0, internal.router.items.createOne._internal_trend_action, {
    itemId: item,
  });

  await ctx.runMutation(internal.router.credits.deductCredits._internal, {
    userId: data.userId,
    amount: CREDITS_CONFIG.COST_PER_ITEM,
    itemId: item,
  }).catch(() => null);

  return item;
}