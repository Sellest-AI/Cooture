import { removeUndefinedKeys } from "@shared/utils";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { authMutation } from "../../procedures";
import { userSizes } from "../../schema/users";

export const authed = authMutation({
  args: {
    frontImageId: v.optional(v.id("images")),
    sideImageId: v.optional(v.id("images")),
    smileImageId: v.optional(v.id("images")),
    heightCm: v.optional(v.number()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"))),
    size: v.optional(userSizes)
    // topAngleImageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    const { userId } = ctx;
    const { frontImageId, sideImageId, smileImageId, heightCm, gender, size } = args

    const existingPortraits = await ctx.db.query("usersAppearance")
      .withIndex("by_user_id", (q) => q.eq("userId", userId)).first();

    const toUpdate = removeUndefinedKeys({
      frontImageId,
      sideImageId,
      smileImageId,
      heightCm,
      gender,
      size,
    })

    if (existingPortraits) {
      await ctx.db.patch(existingPortraits._id, toUpdate);

      if (existingPortraits.frontImageId && frontImageId)
        await ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, {
          imageId: existingPortraits.frontImageId
        });

      if (existingPortraits.smileImageId && smileImageId)
        await ctx.scheduler.runAfter(1000, internal.router.storage.images.deleteOne._internal, {
          imageId: existingPortraits.sideImageId
        });

      if (existingPortraits.sideImageId && sideImageId)
        await ctx.scheduler.runAfter(2000, internal.router.storage.images.deleteOne._internal, {
          imageId: existingPortraits.sideImageId
        });

      return existingPortraits._id;
    }

    if (!frontImageId || !sideImageId || !smileImageId)
      throw new Error("Missing images for new portraits");

    return ctx.db.insert("usersAppearance", {
      userId,
      frontImageId,
      sideImageId,
      smileImageId,
      heightCm,
      size,
      // topAngleImageId,
    });
  }
})