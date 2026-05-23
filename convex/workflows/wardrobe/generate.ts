import { defineEvent, vWorkflowId } from "@convex-dev/workflow";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { extractPosition } from "../../functions/items/extractPosition";
import { buildOutfitCombinations, GenderTag, GroupedPositions, WeatherTag } from "../../functions/outfits/generator";
import { getTagsFromHexColors } from "../../lib/color";
import { convertTagsToString } from "../../lib/helpers/tagsConverter";
import { internalMutation } from "../../procedures";
import { ITEM_CATEGORIES, ITEM_GENDERS, ITEM_WEATHERS, ITEMS_SCHEMA } from "../../schema/items";
import { workflow } from "../config";

const vGroupedItems = v.array(v.object({
  id: v.id("items"),
  mainColors: v.array(v.string()),
  weatherTags: v.array(v.string()),
  gender: v.string(),
}));

export const scanItemsDoneEvent = defineEvent({
  name: "scanItemsDone",
  validator: v.object({
    groupedItems: v.record(v.string(), vGroupedItems),
  }),
});

export const run = workflow.define({
  args: {
    palette: v.array(v.string()),
    styles: ITEMS_SCHEMA.styles,
    count: v.number(),
    weather: v.optional(ITEM_WEATHERS),
    gender: v.optional(ITEM_GENDERS),
    userId: v.optional(v.id("users")),
  },
  returns: v.null(),
  handler: async (step, args): Promise<null> => {
    await step.runMutation(internal.workflows.wardrobe.generate.scanItemsIteratively, {
      palette: args.palette,
      styles: args.styles,
      userId: args.userId,
      cursor: null,
      workflowId: step.workflowId,
      accumulator: {},
    });

    const { groupedItems } = await step.awaitEvent(scanItemsDoneEvent);

    await step.runMutation(internal.workflows.wardrobe.generate.generateCombinations, {
      groupedItems,
      palette: args.palette,
      styles: args.styles,
      weather: args.weather,
      gender: args.gender,
      userId: args.userId,
      targetCount: args.count,
    });

    return null;
  },
});

export const scanItemsIteratively = internalMutation({
  args: {
    palette: v.array(v.string()),
    styles: v.array(v.string()),
    userId: v.optional(v.id("users")),
    cursor: v.union(v.string(), v.null()),
    workflowId: vWorkflowId,
    accumulator: v.record(v.string(), vGroupedItems),
  },
  handler: async (ctx, args) => {
    const { cursor, palette, styles, userId, workflowId } = args;

    const colorTagsArray = getTagsFromHexColors(palette);

    const queryInfo = userId
      ? ctx.db.query("items").withIndex("by_user_id", q => q.eq("userId", userId))
      : ctx.db.query("items");

    const result = await queryInfo.paginate({ cursor, numItems: 512 });
    const { page, continueCursor, isDone } = result;
    const acc = { ...args.accumulator };

    for (const item of page) {
      const hasStyle = item.styles.some((s: string) => styles.includes(s));
      if (!hasStyle) continue;

      const hasColor = colorTagsArray.some((tag: string) => item.colorTags.includes(tag));
      if (!hasColor) continue;

      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push({
        id: item._id,
        mainColors: item.mainColors,
        weatherTags: item.weatherTags,
        gender: item.gender,
      });
    }

    if (isDone) {
      await workflow.sendEvent(ctx, {
        name: scanItemsDoneEvent.name,
        workflowId,
        value: { groupedItems: acc },
      });
      return;
    }

    await ctx.scheduler.runAfter(0, internal.workflows.wardrobe.generate.scanItemsIteratively, {
      palette,
      styles,
      userId,
      cursor: continueCursor,
      workflowId,
      accumulator: acc,
    });
  },
});

export const generateCombinations = internalMutation({
  args: {
    groupedItems: v.record(v.string(), vGroupedItems),
    palette: v.array(v.string()),
    styles: v.array(v.string()),
    weather: v.optional(ITEM_WEATHERS),
    gender: v.optional(ITEM_GENDERS),
    userId: v.optional(v.id("users")),
    targetCount: v.number(),
  },
  handler: async (ctx, args) => {
    const { groupedItems, palette, styles, weather, gender, userId, targetCount } = args;

    const positions = {
      TOP: [], BOTTOM: [], INNERLAYER: [], OUTERWEAR: [], SHOES: [], ACCESSORY: [], LEGWEAR: [], UNDERWEAR: []
    } as GroupedPositions;

    for (const [category, items] of Object.entries(groupedItems)) {
      const pos = extractPosition(category as any);
      const _category = category as typeof ITEM_CATEGORIES[number];
      if (positions[pos]) {
        for (const item of items) {
          positions[pos].push({
            id: item.id,
            category: _category,
            colors: getTagsFromHexColors(item.mainColors),
            weatherTags: item.weatherTags,
            gender: item.gender as GenderTag,
          });
        }
      }
    }

    const seed = Math.floor(Math.random() * 100000);
    const combinations = buildOutfitCombinations(palette, positions, {
      targetCount,
      baseSeed: seed,
      weather: weather as WeatherTag | undefined,
      gender: gender === "UNISEX" ? undefined : gender as ("MALE" | "FEMALE" | undefined),
    });

    let generated = 0;

    for (const outfitItemsArr of combinations) {
      const signature = [...outfitItemsArr].sort().join('_');
      const existing = await ctx.db
        .query("suggestedOutfits")
        .withIndex("by_signature", (q) => q.eq("signature", signature))
        .first();

      if (!existing) {
        const colorTagsArray = getTagsFromHexColors(palette);
        const searchableText = convertTagsToString([...outfitItemsArr, ...styles, ...colorTagsArray]);

        await ctx.db.insert("suggestedOutfits", {
          ...(userId ? { userId } : {}),
          searchableText,
          signature,
          mainColors: palette,
          styles,
          items: outfitItemsArr,
        });

        generated++;
      }
    }

    if (generated > 0)
      console.info(`Generated ${generated} outfits for palette ${palette} and styles ${styles.join(", ")}`);
  },
});
