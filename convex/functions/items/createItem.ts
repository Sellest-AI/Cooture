import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { convertTagsToString } from "../../lib/helpers";
import { ActionCtx } from "../../procedures";
import { CREDITS_CONFIG } from "../credits";
import { getItemFromSku } from "./getFromSku";

type Args = {
  imageId: Id<"images">;
  userId: Id<"users">;
  metadata?: {
    sku?: string;
    brand?: string;
    name?: string;
    description?: string;
    gender?: string;
    fit?: string;
    materials?: string[];
    itemUrl?: string;
    price?: {
      amount: number; // stored in minor units (cents) — avoids float issues
      currency: "EUR" | "USD"; // hardcoded for now, extensible later
    }
  }
}

export const createItem = async (ctx: ActionCtx, data: Args): Promise<Id<"items">> => {
  if (data.metadata?.sku) {
    const alreadyExists = await getItemFromSku(ctx, data.metadata?.sku);
    if (alreadyExists) return alreadyExists._id;
  }

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
    price: data.metadata?.price?.amount,
    currency: data.metadata?.price?.currency,
    sku: data.metadata?.sku,
  });

  await ctx.runMutation(internal.router.credits.deductCredits._internal, {
    userId: data.userId,
    amount: CREDITS_CONFIG.COST_PER_ITEM,
    itemId: item,
  }).catch(() => null);

  return item;
}