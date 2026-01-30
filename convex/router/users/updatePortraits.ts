import { v } from "convex/values";
import { authMutation } from "../../procedures";

export const updatePortraits = authMutation({
  args: {
    frontImageId: v.id("images"),
    sideImageId: v.id("images"),
    topAngleImageId: v.id("images"),
  },
  handler: async (ctx, { frontImageId, sideImageId, topAngleImageId }) => {
    const { userId } = ctx;

    const existingPortraits = await ctx.db.query("userPortraits").withIndex("by_user_id", (q) =>
      q.eq("userId", userId)).first();

    if (existingPortraits) {
      await ctx.db.patch(existingPortraits._id, {
        frontImageId,
        sideImageId,
        topAngleImageId,
      });
      return existingPortraits._id;
    }

    return ctx.db.insert("userPortraits", {
      userId,
      frontImageId,
      sideImageId,
      topAngleImageId,
    });
  }
})