import { removeUndefinedKeys } from "@shared/utils";
import { ConvexError, v } from "convex/values";
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

    // Portraits feed every photoshoot, and replaced ones are deleted below — so they must be
    // images the caller uploaded, not someone else's face (and not someone else's file to delete).
    for (const imageId of [frontImageId, sideImageId, smileImageId]) {
      if (!imageId) continue;
      const owned = await ctx.db.query("userImages")
        .withIndex("by_image_id", (q) => q.eq("imageId", imageId)).first();
      if (owned?.userId !== userId) throw new ConvexError("Unauthorized");
    }

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
          imageId: existingPortraits.smileImageId
        });

      if (existingPortraits.sideImageId && sideImageId)
        await ctx.scheduler.runAfter(2000, internal.router.storage.images.deleteOne._internal, {
          imageId: existingPortraits.sideImageId
        });

      return existingPortraits._id;
    }

    // If user is still in waitlist, approve them as they upload their portraits (20s)
    if (ctx.user.accountStatus === 'WAITLIST')
      await ctx.scheduler.runAfter(20000, internal.router.admin.users.approveWaitlist._internal, {
        amountToApprove: 1,
        userIds: [userId]
      })

    return ctx.db.insert("usersAppearance", {
      userId,
      frontImageId,
      sideImageId,
      smileImageId,
      heightCm,
      gender,
      size,
      // topAngleImageId,
    });
  }
})