import { sanitizeTag } from "@/lib/helpers";
import { retryPromise } from "@shared/utils";
import { z } from "zod";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool, wrapAgent } from "../utils";

// ============================================================================
// 1. EXTENSIBLE TREND REGISTRY
// ============================================================================

export const TREND_REGISTRY: TrendDefinition[] = [
  {
    name: "Gorpcore",
    description: "Utilitarian, outdoor-focused gear worn as streetwear.",
    keyIndicators: [
      "Waterproof or technical materials (nylon, gore-tex)",
      "Utilitarian features (bungee cords, cargo pockets, waterproof zippers, drawstrings)",
      "Categories: OUTERWEAR, JACKET, SHOES (hiking style), BOTTOM (cargo)",
      "Styles: SPORTY combined with streetwear vibes"
    ],
  },
  {
    name: "Y2K",
    description: "Late 90s to mid-2000s retro-futurism and pop culture.",
    keyIndicators: [
      "Baggy or aggressively cropped fits",
      "Materials like denim, velour, or shiny synthetics",
      "Features like distressed elements, rhinestones, graphic prints",
    ],
  },
  {
    names: ["Old Money", "Quiet Luxury"],
    description: "Minimalist, high-quality, logo-less wealth aesthetics.",
    keyIndicators: [
      "Natural premium materials (wool, silk, cotton, cashmere)",
      "Neutral, muted color palettes (beige, navy, cream)",
      "Classic categories like SWEATER, DRESS, OUTERWEAR (coats)",
    ],
  },
  {
    names: ["Neo-Minimalism", "Normcore"],
    description: "Effortless, clean, and intentionally simple dressing focused on high-quality basics.",
    keyIndicators: [
      "Neutral, monochromatic, or muted color palettes (black, white, grey, beige)",
      "Clean silhouettes with no loud logos or heavy patterns",
      "Categories: TSHIRT (basic), JEANS (straight-leg), SNEAKERS (clean/white)",
      "Styles: MINIMALIST, CASUAL"
    ],
  },
  {
    names: ["Parisian Chic", "Classic Elegance"],
    description: "Timeless European sophistication mixing structured staples with relaxed romance.",
    keyIndicators: [
      "Classic wardrobe staples: Trench coats, tailored trousers, crisp white button-downs, little black dresses",
      "Ballet flats, loafers, and structured leather handbags",
      "Patterns: Subtle stripes (Breton) or polka dots",
      "Categories: OUTERWEAR (trench), TOP (blouse/shirt), SHOES (flats)"
    ],
  },
  {
    name: "Boho Chic",
    description: "A dreamy mix of earthy textures, vintage finds, and effortless, flowy charm.",
    keyIndicators: [
      "Earthy tones and warm colors",
      "Flowy fabrics, macrame, crochet, fringe, and floral patterns",
      "Categories: DRESS (maxi), TOP (peasant blouse), ACCESSORY (wide-brim hat, layered jewelry)",
      "Styles: BOHO, VINTAGE"
    ],
  },
  {
    name: "Grunge",
    description: "Rebellious, anti-fashion edge rooted in 90s rock culture.",
    keyIndicators: [
      "Distressed denim, ripped textures, oversized fits",
      "Plaid flannel, dark denim, heavy leather boots (e.g., Doc Martens)",
      "Categories: JACKET (leather/biker), JEANS (distressed), SHOES (combat boots)",
      "Styles: EDGY, GOTHIC"
    ],
  },
  {
    names: ["Poet-Core", "Dark Academia"],
    description: "A blend of creative spirit, moody nostalgia, and preppy academic style.",
    keyIndicators: [
      "Oversized turtlenecks, vintage blazers, satchel bags, silk neckties",
      "Rich, dark color tones (burgundy, forest green, dark brown)",
      "Materials like tweed, wool, and lace details",
      "Categories: SWEATER, JACKET (blazer), ACCESSORY (scarves/ties)",
      "Styles: PREPPY, VINTAGE"
    ],
  },
  {
    names: ["Glamoratti", "Mob Wife Aesthetic"],
    description: "Unapologetic, high-impact 80s opulence. Command space and drip in confidence.",
    keyIndicators: [
      "Faux fur coats, animal prints (leopard), leather",
      "Sculpted-shoulder suits, dramatic funnel necks",
      "Chunky gold accessories, big cuffs, belts",
      "Styles: CHIC, EDGY"
    ],
  },
  {
    names: ["Utility-Chic", "Earthcore"],
    description: "Functional outdoor styling elevated by thoughtful tailoring and natural textures.",
    keyIndicators: [
      "Earthy tones mixed with modern fabrications",
      "Utility details (pockets, adjustable elements) but with relaxed, flattering fits",
      "Materials: Canvas, heavy cotton, technical blends",
      "Categories: BOTTOM (cargo pants/skirts), OUTERWEAR (utility vests/jackets)"
    ],
  },
  {
    names: ["Street Bride", "Undone Romance"],
    description: "Reclaiming traditional romantic and bridal fabrics for edgy everyday streetwear.",
    keyIndicators: [
      "Sheer lace, corsetry, slip dresses, tulle",
      "Mixed with heavy contrast pieces (e.g., a delicate lace skirt with combat boots or an oversized blazer)",
      "Colors: White, cream, vanilla yellow mixed with dark accents",
      "Styles: ECLECTIC, EDGY"
    ],
  },
  {
    names: ["Retro-Futurism", "Techwear"],
    description: "Sci-fi tactical aesthetics meeting sleek, wearable modern design.",
    keyIndicators: [
      "Metallic finishes, glossy textures, shiny synthetics",
      "Sleek lines paired with tactical utility (buckles, straps)",
      "Colors: Silver, black, neon accents",
      "Styles: SPORTY, EDGY"
    ]
  }
];

export type TrendDefinition = {
  description: string;
  keyIndicators: string[];
} & ({ name: string, names?: undefined } | { name?: undefined, names: string[] });

// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------

const generateTrendMarkdown = (trends: TrendDefinition[]): string => {
  return trends
    .map((trend) => {
      const indicators = trend.keyIndicators.map((i) => `  - ${i}`).join("\n");
      return `### ${trend.names?.[0] ?? trend.name}\n${trend.description}\n**Key Indicators:**\n${indicators}`;
    })
    .join("\n\n");
};

// ============================================================================
// 2. BASE INSTRUCTIONS
// ============================================================================
const INSTRUCTIONS = `You are an expert fashion trend analyst AI. 
Your job is to analyze the provided JSON data representing either a single clothing item or a complete outfit (an array of items).
Based on the categories, materials, colors, styles, and features, assign up to 5 relevant fashion trends.

Here is your currently known Trend Knowledge Base:

${generateTrendMarkdown(TREND_REGISTRY)}

Instructions:
- Evaluate how strongly the items match the key indicators. Assign a confidence score from 1 to 100.
- Analyze the synergy of the items. (e.g., A plain white tee is just a basic, but paired with cargo pants and Salomon shoes, the *outfit* becomes Gorpcore).
- You may use trends from the Knowledge Base, or suggest generic trends (e.g., 'Streetwear', 'Casual', 'Minimalist') if the item strongly dictates it.
- Only return trends with a confidence score of 50 or higher.
- RETURN THE DATA IN JSON FORMAT ONLY.
`;

// ============================================================================
// 3. THE TOOL
// ============================================================================
export const trendExtractor = createTool({
  description: "Extracts fashion trends and confidence scores from one or multiple items (outfit).",
  args: z.object({
    itemsData: z.array(z.record(z.string(), z.any())).min(1)
      .describe("Array of item data objects. Pass 1 object for a single item, or multiple for an outfit."),
  }),
  handler: async (ctx, args): Promise<{ name: string; confidence: number }[]> => {
    const isOutfit = args.itemsData.length > 1;

    // Optimized Schema: Only asking for Name and Confidence
    const schema = z.object({
      trends: z.array(
        z.object({
          name: z.string().describe("The exact name of the trend (e.g., 'Gorpcore')."),
          confidence: z.number().min(1).max(100).describe("Confidence score from 1 to 100 based on how strongly the item/outfit matches the trend."),
        })
      ).max(5).describe("List of matched trends, ordered by highest confidence first.")
    });

    const generateTrends = async () => retryPromise(() =>
      wrapAgent(defaultAgent).generateObject(ctx, {}, {
        model: models.offload.cheapest.model,
        providerOptions: models.offload.cheapest.providerOptions({ effort: 'none' }),
        system: INSTRUCTIONS,
        prompt: [
          {
            role: 'user',
            content: [
              {
                type: 'text' as const,
                text: `Analyze the following fashion data representing ${isOutfit ? "a complete outfit" : "a single item"}:\n\n${JSON.stringify(args.itemsData, null, 2)}`
              }
            ]
          }
        ],
        output: "object",
        maxRetries: 3,
        schema,
      }, { storageOptions: { saveMessages: 'none' } }).then((r) => r.object)
    );

    const result = await generateTrends();

    const trends = result.trends.map((trend) => {
      const name = sanitizeTag(trend.name);
      const confidence = trend.confidence / 100;

      // Try to find the trend in the registry to get the proper name (handles aliases)
      const registryEntry = TREND_REGISTRY.find((t) =>
        sanitizeTag(t.name ?? t.names?.[0]) === name ||
        (t.names && t.names.some((n) => sanitizeTag(n) === name))
      );

      return [
        {
          name,
          confidence,
        },
        ...(registryEntry?.names?.map((alias) => ({
          name: sanitizeTag(alias),
          confidence,
        })) || [])
      ]
    })
      .flat()
      // Remove duplicates from aliases
      .filter((t, index, self) => index === self.findIndex((s) => s.name === t.name))
      .sort((a, b) => b.confidence - a.confidence);

    return trends;
  }
});