// trendRegistry.ts
export type TrendDefinition = {
  name: string;
  description: string;
  keyIndicators: string[]; // What the LLM should look for
};

export const TREND_REGISTRY: TrendDefinition[] = [
  {
    name: "Gorpcore",
    description: "Utilitarian, outdoor-focused gear worn as streetwear.",
    keyIndicators: [
      "Waterproof or technical materials (nylon, gore-tex)",
      "Utilitarian features (bungee cords, cargo pockets, waterproof zippers)",
      "Earth tones mixed with bright neon accents",
      "Categories: OUTERWEAR, JACKET, SHOES (hiking style)",
    ],
  },
  {
    name: "Y2K",
    description: "Late 90s to mid-2000s retro-futurism and pop culture.",
    keyIndicators: [
      "Baggy or aggressively cropped fits",
      "Materials like denim, velour, or shiny synthetics",
      "Graphic prints, rhinestones, or distressed elements",
      "Categories: JEANS (baggy), TOP (cropped)",
    ],
  },
  {
    name: "Old Money / Quiet Luxury",
    description: "Minimalist, high-quality, logo-less wealth aesthetics.",
    keyIndicators: [
      "Natural premium materials (wool, silk, cotton, cashmere)",
      "Neutral, muted color palettes (beige, navy, cream)",
      "Tailored or regular fits without loud patterns or logos",
      "Categories: SWEATER, BOTTOM (trousers), OUTERWEAR (coats)",
    ],
  },
  // ADD NEW TRENDS HERE IN THE FUTURE!
];

// This helper converts the array into a clean Markdown list for the LLM Prompt
export const generateTrendMarkdown = (trends: TrendDefinition[]): string => {
  return trends
    .map((trend) => {
      const indicators = trend.keyIndicators.map((i) => `  - ${i}`).join("\n");
      return `### ${trend.name}\n${trend.description}\n**Key Indicators:**\n${indicators}`;
    })
    .join("\n\n");
};


