import { v } from "convex/values";
import { CREDITS_CONFIG } from "../../functions/credits";
import { publicQuery } from "../../procedures";

const type = v.union(
  v.literal("GENERATION_COST"),
  v.literal("ITEM_CREATION_COST"),
  v.literal("PRESET_CREATION_COST")
);

export const anon = publicQuery({
  args: {
    amount: v.optional(v.number()),
    type: type,
  },
  handler: async (_, args) => {
    if (args.type === 'GENERATION_COST') {
      const cost = CREDITS_CONFIG.COST_PER_GENERATION;
      return cost * (args.amount ?? 1);
    }

    if (args.type === 'ITEM_CREATION_COST') {
      const cost = CREDITS_CONFIG.COST_PER_ITEM;
      return cost * (args.amount ?? 1);
    }

    if (args.type === 'PRESET_CREATION_COST') {
      const cost = CREDITS_CONFIG.COST_PER_PRESET;
      return cost * (args.amount ?? 1);
    }

    return 0;
  }
})