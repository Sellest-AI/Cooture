import { retryPromise } from "@shared/utils";
import { z } from "zod";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool } from "../utils";

const INSTRUCTIONS = `You are a fashion analyst AI. Analyze clothing and accessory items from images and extract detailed information.

Return ONLY valid data that matches the exact categories provided. Be specific and accurate.

For categories, choose the MOST SPECIFIC category that applies.
For weather tags, select ALL applicable weather conditions.
For materials, identify the PRIMARY materials visible or typical for the item.

The order of the fields in the arrays ARE VERY IMPORTANT and should reflect the prominence of each attribute in the item.

RETURN THE DATA IN JSON FORMAT ONLY.
`

export const itemCategorizer = createTool({
  description: "Extracts item information from a given image.",
  args: z.object({
    imageUrl: z.string(),
    extractText: z.optional(z.boolean().default(false))
  }),
  handler: async (ctx, args) => {
    const schema = z.object({
      category: z.enum([
        "TOP", "BOTTOM", "DRESS", "OUTERWEAR", "SHOES", "ACCESSORY",
        "HOODIE", "SWEATER", "TSHIRT", "JEANS", "SKIRT", "HAT",
        "CAP", "GLASSES", "BAG", "JACKET"
      ]).describe("The most specific category. E.g., use 'TSHIRT' instead of 'TOP' for t-shirts, 'JEANS' instead of 'BOTTOM' for jeans"),

      weatherTags: z.array(z.enum([
        "COLD", "WARM", "HOT", "RAINY", "SNOWY", "SUNNY", "WINDY"
      ])).min(1).describe("All weather conditions this item is suitable for. Can include multiple. E.g., a light jacket might be ['WARM', 'WINDY']"),

      colorTones: z.array(z.enum([
        "LIGHT", "DARK", "NEUTRAL", "COLORFUL"
      ])).min(1).describe("Overall color tone(s) of the item. Can include multiple if item has mixed tones"),

      materialFeel: z.enum([
        "SOFT", "MEDIUM", "FIRM", "RIGID"
      ]).describe("The perceived texture/feel of the material. SOFT: cotton tees, silk. MEDIUM: denim, canvas. FIRM: leather, thick wool. RIGID: structured bags, hard accessories"),

      materials: z.array(z.enum([
        "COTTON", "WOOL", "LEATHER", "DENIM", "SILK", "SYNTHETIC",
        "PLASTIC", "METAL", "GLASS", "RUBBER", "WOOD"
      ])).min(1).describe(`ONLY Primary materials the item is made from or appears to be made from.
        Do not add the materials from the openings or buttons of clothing and accessories.
        `),

      gender: z.enum([
        "UNISEX", "MALE", "FEMALE",
      ]).describe("Target gender/age group. Use UNISEX for items that work for anyone"),

      ...(args.extractText ? {
        description: z.string().max(400).describe("A brief text description (max 30 words) suitable for an online store."),
        name: z.string().max(40).describe("A short name for the item."),
      } : {})
    });


    const generateCategories = async () => retryPromise(() =>
      defaultAgent.generateObject(ctx, { userId: ctx.userId }, {
        // Vison model
        providerOptions: models.vision.smartest.providerOptions({ effort: 'none' }),
        model: models.vision.smartest.model,
        // Prompt
        system: INSTRUCTIONS,
        prompt: [
          {
            role: 'user',
            content: [
              { type: 'image', image: args.imageUrl },
              {
                type: 'text',
                text: 'Analyze this clothing item and provide detailed classification information.'
              }
            ]
          }
        ],
        output: "object",
        maxRetries: 5,
        schema,
      }, { storageOptions: { saveMessages: 'none' } }).then((r) => r.object))

    const [result] = await Promise.all([
      generateCategories(),
    ]);

    return {
      ...result,
      name: result.name as string | undefined,
      description: result.description as string | undefined,
    }
  }
})