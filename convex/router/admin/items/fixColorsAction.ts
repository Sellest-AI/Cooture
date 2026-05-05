"use node"
import { getTagsFromHexColors } from "@/lib/color";
import { convertTagsToString } from "@/lib/helpers";
import { extractMainColors } from "@/lib/image/node";
import { v } from "convex/values";
import { internalAction } from "../../../_generated/server";

/** Is used by fixColors. Don't call directly. */
export const _internal_node = internalAction({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const extractedColors = await extractMainColors(args.imageUrl);
    const colors = extractedColors.sort((a, b) => b.percentage - a.percentage);
    const tags = getTagsFromHexColors(colors.filter((c) => c.percentage > 20).slice(0, 2).map((c) => c.hex));
    const colorTags = convertTagsToString(tags);

    return {
      tags: colorTags,
      mainColors: colors.map((c) => c.hex),
    };
  }
})