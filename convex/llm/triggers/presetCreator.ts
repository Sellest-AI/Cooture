import { removeUndefinedKeys } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { imageCategorizer } from "../tools/imageCategorizer";
import { presetCreator } from "../tools/presetCreator";

type Prompt = Awaited<ReturnType<typeof presetCreator.handler>>;
type SanitizedPrompt = Omit<Prompt, 'contentRating'>;

type Return = {
  prompt: SanitizedPrompt;
  categories: Awaited<ReturnType<typeof imageCategorizer.handler>>[number][];
  contentRating: Awaited<ReturnType<typeof presetCreator.handler>>['contentRating'];
}

export const _internal = internalAction({
  args: {
    imageId: v.id("images"),
  },
  handler: async (ctx, { imageId }): Promise<Return> => {
    const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: imageId });
    if (!image) { throw new Error("Image not found"); }

    const toolCtx = {
      runQuery: ctx.runQuery,
      runMutation: ctx.runMutation,
      scheduler: ctx.scheduler,
      runAction: ctx.runAction,
      auth: ctx.auth,
      storage: ctx.storage,
      vectorSearch: ctx.vectorSearch,
      userId: undefined,
      meta: ctx.meta,
    }

    const [prompt, categories] = (await Promise.all([
      presetCreator.handler(toolCtx, { imageUrl: image.url }),
      imageCategorizer.handler(toolCtx, { imageUrl: image.url }),
    ]));

    // Filter to only high-confidence categories
    const allCategories = categories.flatMap(p => p);
    const highConfidenceCategories = allCategories.filter(cat => cat.confidence >= 0.4);
    const uniqueCategories = Array.from(new Set(highConfidenceCategories.map(c => c.name)))
      .map(name => highConfidenceCategories.find(c => c.name === name)!)

    const contentRating = prompt.contentRating;

    const sanitizedPrompt = removeUndefinedKeys({ ...prompt, contentRating: undefined }) as SanitizedPrompt;

    return { prompt: sanitizedPrompt, categories: uniqueCategories, contentRating };

  }
})