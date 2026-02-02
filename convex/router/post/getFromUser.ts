import { v } from "convex/values";
import { getImage } from "../../functions/images";
import { publicQuery } from "../../procedures";

export const anon = publicQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    const generations = await ctx.db.query('generations')
      .withIndex('by_status_and_user_id', (q) => q.eq('status', 'COMPLETED').eq('userId', userId))
      .order('desc')
      .collect();

    // Return all accepted predictions
    const predictions = await Promise.all(generations.map(async (generation) => {
      const _predictions = await ctx.db.query('predictions')
        .withIndex('by_generation_id', (q) => q.eq('generationId', generation._id))
        .collect();
      const filtered = _predictions.filter((p) => p.status === 'ACCEPTED');
      return await Promise.all(filtered.map(async (p) => ({
        image: p.imageId ? await getImage(ctx, p.imageId) : null,
        ...p
      })))
    }));

    return predictions.flat();
  }
})