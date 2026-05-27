import { en, Faker } from "@faker-js/faker";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { ActionCtx } from "../procedures";
import { ITEM_STYLES, OUTFIT_PALETTES } from "../schema/constants";
import { workflow } from "../workflows/config";

const V_ITEM_STYLES = v.union(...ITEM_STYLES.map(v.literal));

export const _internal = internalAction({
  args: {
    customStyle: v.optional(V_ITEM_STYLES),
  },
  handler: async (ctx: ActionCtx, args) => {
    console.log("Generating suggested outfits...");

    const faker = new Faker({ locale: en });
    faker.seed(Date.now());

    // Example logic: Pick a few random palettes and styles to generate daily
    // Increase these numbers if you want to generate more varieties per day
    const palettesToGenerate = faker.helpers.arrayElements(OUTFIT_PALETTES.map((c) => c.colors), 3);
    // const styleToGenerate = args.customStyle || faker.helpers.arrayElement(ITEM_STYLES);
    const stylesToGenerate = args.customStyle ? [args.customStyle] : ITEM_STYLES;

    // Trigger workflows for the selected combinations in background
    for (const palette of palettesToGenerate) {
      for (const styleToGenerate of stylesToGenerate) {
        console.log(`Scheduling generation for style ${styleToGenerate} and palette ${palette.join(", ")}`);

        await workflow.start(ctx, internal.workflows.wardrobe.generate.run, {
          palette,
          styles: [styleToGenerate],
          count: 10, // Ask the workflow to attempt 20 realistic outfits for this combo
        });

      }

    }
  }
});
