import { notEmpty, retryPromise } from "@shared/utils";
import { z } from "zod";
import { ITEM_STYLES } from "../../schema/constants";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool, wrapAgent } from "../utils";

const INSTRUCTIONS = `You are a fashion analyst AI. Analyze clothing and accessory items from images and extract detailed information.

Return ONLY valid data that matches the exact categories provided. Be specific and accurate.

CRITICAL: You MUST use ONLY the categories listed in the schema. If the exact item type isn't available, choose the CLOSEST match:
- For specific tops not listed (e.g., blouse, tank top) → use "TOP"
- For specific bottoms not listed (e.g., shorts, leggings) → use "BOTTOM"  
- For legwear (e.g., tights, stockings) → use "LEGWEAR"
- For specific shoes not listed (e.g., sneakers, boots) → use "SHOES"
- For accessories not listed (e.g., scarf, belt, jewelry) → use "ACCESSORY"
- For outerwear not listed (e.g., coat, vest) → use "OUTERWEAR"

For categories, choose the MOST SPECIFIC category that applies FROM THE AVAILABLE OPTIONS.
For weather tags, select ALL applicable weather conditions.
For materials, identify the PRIMARY materials visible or typical for the item.
For the features array, act as a fashion trend analyst. Look for the defining physical characteristics that give the item its 'vibe'. Ignore standard, boring construction details. Focus on hardware (e.g., exposed zippers, chains), fabric treatments (e.g., acid wash, distressed, quilted), silhouette modifiers (e.g., padded shoulders, cropped, drop-shoulder), and specific functional details (e.g., utility pockets, bungee cords).

FOR CONTENT RATING:
- SAFE: Appropriate for all audiences (e.g., t-shirts, jeans, sneakers) (all audience)
- SUGGESTIVE: Revealing but not explicit (e.g., short skirt, low-cut top) (all audience)
- EXPLICIT: Highly revealing or explicit (e.g., lingerie, swimwear) (15+ audience)
- NSFW: Use only for items that are highly revealing, fetish wear, or explicit in nature. (18+ audience)
When in doubt about content rating, default to the most conservative option.

The order of the fields in the arrays ARE VERY IMPORTANT and should reflect the prominence of each attribute in the item.

If a URL is included, do not mix the website's domain name with the clothing brand (for example, zalando = website, adidas = brand).

RETURN THE DATA IN JSON FORMAT ONLY.
`

export const itemCategorizer = createTool({
  description: "Extracts item information from a given image.",
  args: z.object({
    imageUrl: z.string(),
    extractText: z.optional(z.boolean().default(false)),
    metadata: z.optional(z.object({
      brand: z.optional(z.string()),
      name: z.optional(z.string()),
      description: z.optional(z.string()),
      gender: z.optional(z.string()),
      fit: z.optional(z.string()),
      materials: z.optional(z.array(z.string())),
      url: z.optional(z.string()),
    })),
  }),
  handler: async (ctx, args) => {
    const schema = z.object({
      category: z.enum([
        "TOP", "BOTTOM", "DRESS", "OUTERWEAR", "SHOES", "ACCESSORY",
        "HOODIE", "SWEATER", "TSHIRT", "JEANS", "SKIRT", "HAT",
        "CAP", "GLASSES", "BAG", "JACKET", "LEGWEAR"
      ]).describe("The most specific category. E.g., use 'TSHIRT' instead of 'TOP' for t-shirts, 'JEANS' instead of 'BOTTOM' for jeans"),

      features: z.array(z.string()).max(5).describe(
        "Distinctive fashion details, hardware, or construction elements. Examples: 'cargo pockets', 'distressed', 'drawstrings', 'asymmetrical', 'pleated', 'graphic print', 'chunky sole'. Do not include basic elements like 'sleeves' or 'buttons' unless they are visually defining."
      ),
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

      styles: z.array(z.enum(ITEM_STYLES))
        .describe(`The style(s) of the item. Can include multiple styles if the item clearly incorporates elements of each.`),

      contentRating: z.enum([
        "SAFE", "SUGGESTIVE", "EXPLICIT", "NSFW"
      ]).describe("The content rating of the item. Fallback to the most conservative rating if unsure."),

      gender: z.enum([
        "UNISEX", "MALE", "FEMALE",
      ]).describe("Target gender/age group. Use UNISEX for items that work for anyone"),

      fit: z.enum([
        "TIGHT", "REGULAR", "LOOSE"
      ]).describe("The fit of the item. TIGHT: body-hugging, stretchy items. REGULAR: standard fit, not too tight or loose. LOOSE: oversized, relaxed fit")
        .default("REGULAR"),

      ...(args.extractText ? {
        description: z.string().max(400).describe("A brief text description (max 30 words) suitable for an online store."),
        name: z.string().max(40).describe("A short name for the item."),
        brand: z.string().max(40).optional().describe("The brand of the item, if identifiable from the image or metadata."),
      } : {})
    });


    const generateCategories = async () => retryPromise(() =>
      wrapAgent(defaultAgent).generateObject(ctx, {}, {
        // Vison model
        providerOptions: models.vision.smart.providerOptions({ effort: 'none' }),
        model: models.vision.smart.model,
        // Prompt
        system: INSTRUCTIONS,
        prompt: [
          {
            role: 'user',
            content: [
              { type: 'image' as const, image: args.imageUrl },
              args.metadata ? {
                type: 'text' as const,
                text: `The following metadata has been extracted: ${JSON.stringify(args.metadata)}.
Use this information to help you analyze the item, but do not include it in the final output if it doesn't match the visual characteristics of the item. If there is a conflict between the metadata and the image, prioritize the visual analysis.`
              } : undefined,
              {
                type: 'text' as const,
                text: 'Analyze this clothing item and provide detailed classification information. IMPORTANT: Use ONLY the exact category values from the schema. If unsure, pick the closest general category.'
              }
            ].filter(notEmpty)
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
      brand: result.brand as string | undefined,
    }
  }
})