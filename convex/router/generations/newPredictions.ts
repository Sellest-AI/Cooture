import { v } from "convex/values";
import { Id } from "../../_generated/dataModel";
import { internalMutation } from "../../procedures";

export const _internal = internalMutation({
  args: {
    generationId: v.id("generations"),
    predictionIds: v.array(v.string()),
  },
  handler: async (ctx, { predictionIds, generationId }): Promise<Id<'generations'>> => {
    const generation = await ctx.db.get(generationId);
    if (!generation) throw new Error("Generation not found");

    await ctx.db.patch(generationId, {
      status: "LOADING",
      publication: "DRAFT",
    });

    await Promise.all(predictionIds.map(predictionId => ctx.db.insert('predictions', {
      predictionId,
      generationId,
      status: 'LOADING',
    })));

    return generationId;
  }
})