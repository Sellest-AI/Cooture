import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { isAuthorized } from "../../functions/users";
import { authMutation } from "../../procedures";

export const authed = authMutation(({
  args: {
    generationId: v.id("generations"),
  },
  handler: async (ctx, args) => {
    await isAuthorized(ctx, args.generationId);

    const predictions = await ctx.db.query("predictions").withIndex("by_generation_id", (q) =>
      q.eq("generationId", args.generationId)).collect();

    /**
     * Reject all pending (in review) predictions of this generation.
     * If user validated some predictions but left some others in pending, it can create a bad UX where the generation appears published but with some predictions still in review. 
     * It's better to just reject all pending predictions to make sure the state is clear for the user.
     */

    const canBePublished = predictions.some((p) => p.status === "ACCEPTED");
    if (!canBePublished) return false;

    for (const prediction of predictions) {
      if (prediction.status === "REVIEW")
        await ctx.runMutation(internal.router.generations.updatePrediction._internal, {
          predictionId: prediction._id,
          status: "REJECTED",
        })
    }

    return true;
  }
}))