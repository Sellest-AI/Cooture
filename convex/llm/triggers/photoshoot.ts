"use node";
import { predictImage } from "@/lib/replicate/node";
import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ActionCtx, authAction } from "../../procedures";
import { PRESET_PROMPT } from "../../schema/presets";

type Schema = {
  prompt: typeof PRESET_PROMPT['type'];
  images: { url: string; hasAlpha: boolean }[];
}

const OUTFIT_SIZES_ARGS = v.union(v.literal("TIGHT"), v.literal("DEFAULT"), v.literal("LOOSE"), v.literal("EXTRA_LOOSE"));
type OutfitSize = 'TIGHT' | 'DEFAULT' | 'LOOSE' | 'EXTRA_LOOSE';

const updateOutfit = async (ctx: ActionCtx, schema: Schema, _outfit?: { _id: Id<'outfits'>, size?: OutfitSize }): Promise<Schema> => {
  if (!_outfit) return schema;

  const outfit = await ctx.runQuery(internal.router.outfits.getOne._internal, { outfitId: _outfit._id });
  if (!outfit) return schema;

  // ---- EXTRACT ITEMS BY POSITION ----
  const top = outfit.items.find(i => i.position === 'TOP');
  const bottom = outfit.items.find(i => i.position === 'BOTTOM');
  const innerLayer = outfit.items.find(i => i.position === 'INNERLAYER');
  const outerwear = outfit.items.find(i => i.position === 'OUTERWEAR');
  const accessories = outfit.items.filter(i => i.position === 'ACCESSORY');
  const shoes = outfit.items.find(i => i.position === 'SHOES');

  const hasItems = top || bottom || innerLayer || outerwear || accessories.length > 0 || shoes;
  if (!hasItems) return schema;

  // Helper function to build details string
  const buildDetails = (item: typeof top | typeof bottom | typeof outerwear) => {
    if (!item) return '';
    const parts = [
      ...item.mainColors,
      ...item.materials.map(m => m.toLowerCase()),
      item.name,
    ];
    if (item.description) { parts.push(item.description); }
    return parts.join(' ');
  };

  // ---- IMAGES REFERENCES ----
  const baseImageIndex = schema.images.length + 1;
  const references = [
    top ? { ...top, url: top.image.url, hasAlpha: top.image.hasAlpha } : undefined,
    bottom ? { ...bottom, url: bottom.image.url, hasAlpha: bottom.image.hasAlpha } : undefined,
    outerwear ? { ...outerwear, url: outerwear.image.url, hasAlpha: outerwear.image.hasAlpha } : undefined,
    innerLayer ? { ...innerLayer, url: innerLayer.image.url, hasAlpha: innerLayer.image.hasAlpha } : undefined,
    ...(accessories.map((acc) => ({ ...acc, url: acc.image.url, hasAlpha: acc.image.hasAlpha }))),
    shoes ? { ...shoes, url: shoes.image.url, hasAlpha: shoes.image.hasAlpha } : undefined,
  ].filter(notEmpty).map((item, i) => ({
    type: item.position,
    url: item.url,
    hasAlpha: item.hasAlpha,
    text: `Use image ${baseImageIndex + i} for the ${item.position.toLowerCase()}.`
  }));

  const images = [...schema.images, ...references]

  // Build outfit description
  const itemNames = outfit.items.map(item => item.name);
  const description = itemNames.length > 0 ? `An outfit featuring ${itemNames.join(', ')}` : schema.prompt.outfit.description;
  const outfitSize = _outfit.size ? `VERY IMPORTANT: ${_outfit.size.replaceAll('_', ' ')} fit on the subject` : undefined;

  // ---- CUSTOM OUTFIT ----
  const customOutfit = {
    description,
    references: references.map((ref) => ref.text),
    top: top ? {
      type: top.name,
      details: buildDetails(top),
      reference: references.filter((r) => r.type === 'TOP').map((r) => r.text).join(' '),
      fit: outfitSize ?? 'default',
    } : {
      type: 'White t-shirt',
      details: 'A plain white cotton t-shirt',
    },
    bottom: bottom ? {
      type: bottom.name,
      details: buildDetails(bottom),
      reference: references.filter((r) => r.type === 'BOTTOM').map((r) => r.text).join(' '),
      fit: outfitSize ?? 'default',
    } : (top?.description?.includes('dress') ? undefined : {
      type: 'Blue jeans',
      details: 'Classic blue straight denim jeans',
    }),
    innerLayer: innerLayer
      ? `${innerLayer.mainColors.join(' ')} ${innerLayer.name}${innerLayer.description ? `, ${innerLayer.description}` : ''}`
      : undefined,
    outerwear: outerwear ? {
      type: outerwear.name,
      details: buildDetails(outerwear),
      reference: references.filter((r) => r.type === 'OUTERWEAR').map((r) => r.text).join(' '),
    } : undefined,
    accessories: accessories.length > 0
      ? accessories.map(acc => ({
        [acc.name]: `${acc.mainColors.join(' ')} ${acc.materials.map(m => m.toLowerCase()).join(' ')}${acc.description ? `, ${acc.description}` : ''}`
      }))
      : schema.prompt.outfit.accessories,
    shoes: shoes
      ? `${shoes.mainColors.join(' ')} ${shoes.materials.map(m => m.toLowerCase()).join(' ')} ${shoes.name}${shoes.description ? `, ${shoes.description}` : ''}`
      : schema.prompt.outfit.shoes,
  }

  const prompt = {
    ...schema.prompt,
    outfit: {
      ...schema.prompt.outfit,
      ...customOutfit,
    }
  }

  return { ...schema, images, prompt }
}

const updateSubject = async (ctx: ActionCtx, schema: Schema, userId: Id<'users'>): Promise<Schema> => {
  const portraits = await ctx.runQuery(internal.router.users.getPortraits._internal, { userId });
  if (!portraits) return schema;

  const prompt = {
    ...schema.prompt,
    subject: {
      ...schema.prompt.subject,
      reference: `Use the subject face and skin tone from the reference image ${schema.images.length + 1}. Do not copy facial expression. Use the facial expression from the prompt.`,
      gender: `Keep the gender of the subject as shown in the reference image ${schema.images.length + 1}.`,
    }
  }

  let image = prompt.subject.head.direction === "side" ? portraits.sideImage : portraits.frontImage;
  if (!image) image = portraits.frontImage;

  const images = [...schema.images, { url: image.url, hasAlpha: image.hasAlpha }];

  return {
    ...schema,
    images,
    prompt
  }
}

const updateStyle = async (schema: Schema): Promise<Schema> => {
  const prompt = {
    ...schema.prompt,
    style: {
      ...schema.prompt.style,
      "grain": "Visible film grain texture, medium particle distribution, 35mm analog character, opacity 30-40%, nostalgic film aesthetic"
    },
    technical: {
      ...schema.prompt.technical,
      postProcessing: `${schema.prompt.technical.postProcessing}, subtle 35mm film grain overlay`.replaceAll(',,', ',')
    }
  }

  return {
    ...schema,
    prompt
  }
}

export const authed = authAction({
  args: {
    presetId: v.id("presets"),
    outfit: v.optional(v.object({
      _id: v.id("outfits"),
      size: v.optional(OUTFIT_SIZES_ARGS),
    }))
  },
  handler: async (ctx, args): Promise<Id<'generations'>> => {
    const preset = await ctx.runQuery(internal.router.presets.getOne._internal, { presetId: args.presetId });
    if (!preset) throw new Error("Preset not found");

    let schema: Schema = { prompt: preset.prompts[0], images: [] }
    schema = await updateSubject(ctx, schema, ctx.userId);
    schema = await updateOutfit(ctx, schema, args.outfit);
    schema = await updateStyle(schema);

    const AMOUNT_OF_IMAGES = 2;

    const predictions = await Promise.all(Array.from({ length: AMOUNT_OF_IMAGES }).map(async () => predictImage({
      model: 'bytedance/seedream-4.5',
      images: schema.images,
      prompt: JSON.stringify(schema.prompt),
    })));

    const generationId = await ctx.runMutation(internal.router.generations.createOne._internal, {
      userId: ctx.userId,
      predictionIds: predictions.map(p => p.id),
      preset: {
        presetId: preset._id,
        outfitId: args.outfit?._id,
        prompts: [JSON.stringify(schema.prompt)],
      }
    })

    return generationId;
  }
})