import { notEmpty } from "@shared/utils";
import { publicQuery } from "../../procedures";
import { PRESET_CATEGORY_VALUES } from "../../schema/presets";

const CATEGORIES: typeof PRESET_CATEGORY_VALUES[number][] = [
  // Subject count
  "DUO",

  // Style/Aesthetic
  "CASUAL", "FORMAL", "VINTAGE", "ARTISTIC",

  // Technical/Special
  "TRICKS", "DRAMATIC_LIGHTING", "NATURAL_LIGHT", "GOLDEN_HOUR",

  // Location/Environment
  "STUDIO", "NATURE", "CITY", "BEACH",

  // Purpose
  "ENTERPRISE", "LIFESTYLE", "FASHION", "SOCIAL_MEDIA",

  // Mood
  "PLAYFUL", "SERIOUS", "ROMANTIC",
];

const fixLabel = (cat: typeof PRESET_CATEGORY_VALUES[number]) => {
  const base = cat.slice(0, 1).toUpperCase() + cat.slice(1).toLowerCase().replaceAll('_', ' ');

  switch (cat) {
    case "DUO":
      return `🫂 ${base}`
    case "ARTISTIC":
      return `🎨 ${base}`
    case "TRICKS":
      return `✨ ${base}`
    case "STUDIO":
      return `🏮 ${base}`
    case "FASHION":
      return `👗 ${base}`
    case "SOCIAL_MEDIA":
      return `📷 ${base}`
    case "ROMANTIC":
      return `💕 ${base}`
    default:
      return base;
  }
}

export const anon = publicQuery({
  handler: async (ctx) => {
    const filteredCategories = await Promise.all(CATEGORIES.map(async (cat) => {
      const count = await ctx.db.query('presetCategories')
        .withIndex('by_name_score', (q) => q.eq("name", cat).gte("score", 0.6))
        .first();

      return count ? cat : null;
    }));

    return filteredCategories.filter(notEmpty).map((cat) => ({
      label: fixLabel(cat),
      value: cat,
    }))
  }
})