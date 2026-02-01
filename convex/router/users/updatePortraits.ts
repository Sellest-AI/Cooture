import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { authMutation } from "../../procedures";

export const authed = authMutation({
  args: {
    frontImageId: v.id("images"),
    sideImageId: v.id("images"),
    smileImageId: v.id("images"),
    // topAngleImageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    const { userId } = ctx;
    const { frontImageId, sideImageId, smileImageId } = args

    const existingPortraits = await ctx.db.query("userPortraits").withIndex("by_user_id", (q) =>
      q.eq("userId", userId)).first();

    if (existingPortraits) {
      await ctx.db.patch(existingPortraits._id, {
        frontImageId,
        sideImageId,
        smileImageId,
        // topAngleImageId,
      });

      await ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, {
        imageId: existingPortraits.frontImageId
      });
      await ctx.scheduler.runAfter(1000, internal.router.storage.images.deleteOne._internal, {
        imageId: existingPortraits.sideImageId
      });
      await ctx.scheduler.runAfter(2000, internal.router.storage.images.deleteOne._internal, {
        imageId: existingPortraits.sideImageId
      });

      return existingPortraits._id;
    }

    return ctx.db.insert("userPortraits", {
      userId,
      frontImageId,
      sideImageId,
      smileImageId,
      // topAngleImageId,
    });
  }
})