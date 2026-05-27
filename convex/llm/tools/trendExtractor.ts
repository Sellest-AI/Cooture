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
  // ==========================================
  // EVERGREEN & TIMELESS
  // ==========================================
  {
    name: "Minimalist",
    aliases: ["Normcore", "Neo-Minimalism", "Clean Girl", "Basics"],
    description: "Effortless, clean dressing focused on high-quality basics and neutral palettes.",
    keyIndicators: [
      "ColorTones: NEUTRAL, LIGHT (white, grey, beige, black)",
      "Styles: MINIMALIST, CASUAL",
      "Features: lack of logos, clean lines, basic silhouettes",
    ],
  },
  {
    name: "Old Money",
    aliases: ["Quiet Luxury", "Stealth Wealth", "Traditional"],
    description: "High-quality, logo-less wealth aesthetics rooted in classic tailoring.",
    keyIndicators: [
      "Materials: WOOL, SILK, COTTON, LEATHER",
      "Categories: SWEATER, DRESS, OUTERWEAR (coats), BOTTOM (trousers)",
      "Styles: PREPPY, FORMAL, CHIC",
    ],
  },
  {
    name: "Parisian Chic",
    aliases: ["French Girl", "Classic Elegance"],
    description: "Timeless European sophistication mixing structured staples with relaxed romance.",
    keyIndicators: [
      "Categories: OUTERWEAR (trench coats), TOP (button-downs, blouses), SHOES (ballet flats, loafers)",
      "Features: subtle stripes (Breton), structured leather bags",
      "Styles: CHIC, CASUAL, FORMAL"
    ],
  },
  {
    name: "Streetwear",
    aliases: ["Urban", "Hypebeast", "Skater"],
    description: "Casual, comfortable clothing rooted in skate and hip-hop culture.",
    keyIndicators: [
      "Categories: HOODIE, TSHIRT, SNEAKERS, CAP",
      "Fits: OVERSIZED, BAGGY",
      "Features: graphic prints, heavy cotton, prominent logos",
    ],
  },
  {
    name: "Boho Chic",
    aliases: ["Bohemian", "Festival", "Free Spirit"],
    description: "Earthy, relaxed romance with vintage and artisanal details.",
    keyIndicators: [
      "Materials: COTTON, LEATHER (suede)",
      "Categories: DRESS (maxi), ACCESSORY (layered, wide-brim hats)",
      "Features: fringe, floral patterns, crochet, flowy fits",
    ],
  },
  {
    name: "Grunge",
    aliases: ["Punk", "Alt", "Rocker"],
    description: "Rebellious, anti-fashion edge rooted in 90s rock culture.",
    keyIndicators: [
      "Materials: DENIM, LEATHER, SYNTHETIC",
      "Features: distressed, ripped, plaid, studs, heavy hardware",
      "Styles: EDGY, GOTHIC, VINTAGE",
    ],
  },

  // ==========================================
  // MODERN STAPLES (2020s Defining Aesthetics)
  // ==========================================
  {
    name: "Gorpcore",
    aliases: ["Outdoor Chic", "Utility", "Camping", "Earthcore"],
    description: "Utilitarian, outdoor-focused gear worn as urban fashion.",
    keyIndicators: [
      "Materials: SYNTHETIC (nylon, gore-tex)",
      "Features: waterproof zippers, bungee cords, cargo pockets, drawstrings",
      "Categories: JACKET, OUTERWEAR, SHOES (hiking)",
    ],
  },
  {
    name: "Y2K",
    aliases: ["McBling", "2000s Nostalgia", "Cyber"],
    description: "Late 90s to mid-2000s retro-futurism and pop culture.",
    keyIndicators: [
      "Fits: BAGGY (bottoms), CROPPED or TIGHT (tops)",
      "Materials: DENIM, SYNTHETIC (velour)",
      "Features: rhinestones, low-rise, baby tees, graphic prints",
    ],
  },
  {
    name: "Dark Academia",
    aliases: ["Poetcore", "Prep-Goth", "Scholarly"],
    description: "A moody, intellectual aesthetic blending vintage prep with gothic undertones.",
    keyIndicators: [
      "ColorTones: DARK, NEUTRAL (brown, burgundy, forest green, black)",
      "Materials: WOOL (tweed), COTTON",
      "Categories: SWEATER (cardigans, vests), JACKET (blazer)",
    ],
  },
  {
    name: "Coquette",
    aliases: ["Balletcore", "Soft Girl", "Nymphet"],
    description: "Hyper-feminine, delicate, and romantic styling.",
    keyIndicators: [
      "ColorTones: LIGHT (pastels, pink, white)",
      "Features: bows, lace, ribbons, ruffles, pearls",
      "Categories: DRESS, TOP (corsets), LEGWEAR (tights, leg warmers)",
    ],
  },
  {
    name: "Opium",
    aliases: ["Vamp", "Avant-Garde Gothic", "Tech-Goth"],
    description: "A modern, highly stylized dark aesthetic popularized by underground rap.",
    keyIndicators: [
      "ColorTones: DARK (strictly black)",
      "Materials: LEATHER, SYNTHETIC",
      "Features: extreme oversized fits, aggressive boots, silver chains, spikes",
      "Styles: GOTHIC, EDGY",
    ],
  },

  // ==========================================
  // EMERGING & 2025/2026 FORECASTED TRENDS
  // ==========================================
  {
    name: "Corporatecore",
    aliases: ["Office Siren", "Geek Chic", "9-to-5"],
    description: "Reclaiming rigid corporate office wear into sexy, stylized everyday looks.",
    keyIndicators: [
      "Categories: GLASSES (bayonetta frames), BOTTOM (pencil skirts), TOP (button-downs)",
      "Fits: SLIM, TIGHT",
      "Features: pinstripes, sheer tights, pointed kitten heels",
    ],
  },
  {
    name: "Blokecore",
    aliases: ["Sporty Rich", "Terrace Casuals"],
    description: "Vintage European football (soccer) culture mixed with straight-leg denim.",
    keyIndicators: [
      "Categories: TSHIRT (jerseys), SNEAKERS (low-top vintage, e.g., Sambas)",
      "Features: sports team logos, racing stripes",
      "Styles: SPORTY, VINTAGE, CASUAL",
    ],
  },
  {
    name: "Eclectic Grandpa",
    aliases: ["Grandpacore", "Retro Leisure"],
    description: "Comfortable, quirky, intentionally mismatched vintage layering.",
    keyIndicators: [
      "Categories: SWEATER (knit vests/cardigans), HAT (baseball caps), SHOES (loafers)",
      "Features: argyle patterns, corduroy, chunky knits",
      "Styles: ECLECTIC, VINTAGE",
    ],
  },
  {
    name: "Western Gothic",
    aliases: ["Dark Americana", "Midnight Cowboy"],
    description: "Traditional western wear elements (cowboy) filtered through a dark, moody lens.",
    keyIndicators: [
      "ColorTones: DARK",
      "Materials: LEATHER, DENIM",
      "Features: cowboy boots, fringes, silver bolo ties, heavy buckles",
    ],
  },
  {
    name: "Romcom Core",
    aliases: ["Early 2010s", "Twee Revival"],
    description: "The return of optimistic, slightly quirky early 2010s styling.",
    keyIndicators: [
      "Categories: DRESS (skater dresses), ACCESSORY (statement necklaces, thin belts)",
      "ColorTones: COLORFUL",
      "Features: polka dots, peplum, brightly colored cardigans",
    ],
  },
  {
    name: "Tech-Romance",
    aliases: ["Street Bride", "Cyber-Fairy", "Undone Romance"],
    description: "Juxtaposing delicate romantic fabrics with harsh technical or sporty elements.",
    keyIndicators: [
      "Mix of Materials: SILK/lace paired with SYNTHETIC/nylon",
      "Features: corsets worn over track pants, sheer skirts with bulky sneakers",
      "Styles: ECLECTIC, EDGY, SPORTY",
    ],
  },
  {
    name: "Mob Wife Aesthetic",
    aliases: ["Glamoratti", "80s Opulence", "Maximalist Glam"],
    description: "Unapologetic, high-impact 80s/90s opulence. Command space and drip in confidence.",
    keyIndicators: [
      "Materials: LEATHER, SYNTHETIC (faux fur)",
      "Features: animal prints (leopard), chunky gold jewelry, sculpted shoulders",
      "Styles: CHIC, EDGY, MAXIMALIST"
    ],
  },
  {
    name: "Retro-Futurism",
    aliases: ["Techwear", "Cyberpunk", "Y3K"],
    description: "Sci-fi tactical aesthetics meeting sleek, wearable modern design.",
    keyIndicators: [
      "Materials: SYNTHETIC, PLASTIC, METAL",
      "Features: metallic finishes, glossy textures, tactical buckles, straps",
      "ColorTones: NEUTRAL (silver, black), COLORFUL (neon accents)"
    ]
  }
];

export type TrendDefinition = {
  name: string;
  aliases?: string[];
  description: string;
  keyIndicators: string[];
};

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
      return `### ${trend.name}\n${trend.description}\n**Key Indicators:**\n${indicators}`;
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
      const registryEntry = TREND_REGISTRY.find((t) => sanitizeTag(t.name) === name);

      return [
        {
          name,
          confidence,
        },
        ...(registryEntry?.aliases?.map((alias) => ({
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