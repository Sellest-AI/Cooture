import { v } from "convex/values";
import { getGenerationDetails } from "../../functions/generations/getGenerationDetails";
import { authQuery } from "../../procedures";

export const authed = authQuery({
  args: {
    generationId: v.id("generations"),
  },
  handler: async (ctx, { generationId }) => {
    const [generation, details] = await Promise.all([
      ctx.db.get(generationId),
      getGenerationDetails(ctx, generationId)
    ]);

    if (!generation)
      throw new Error(`Generation with id ${generationId} not found`);

    return {
      ...generation,
      ...details,
    }
  }
})