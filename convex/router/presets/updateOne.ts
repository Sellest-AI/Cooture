import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { authAction, internalMutation } from "../../procedures";

export const authed = authAction({
  args: {
    presetId: v.id("presets"),
    coverUrl: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const images = args.coverUrl ?
      await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
        images: [{ url: args.coverUrl }],
        userId: null,
      }) : [];

    await ctx.runMutation(internal.router.presets.updateOne._internal_step, {
      presetId: args.presetId,
      coverId: images?.[0]._id,
      archived: args.archived,
    })
  }
})

export const _internal_step = internalMutation({
  args: {
    presetId: v.id("presets"),
    coverId: v.optional(v.id("images")),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const preset = await ctx.db.get(args.presetId);
    if (!preset) throw new Error("Preset not found");

    if (args.coverId) {
      await ctx.db.patch(args.presetId, { imageIds: [args.coverId] });

      // Delete all previous images
      await Promise.all(preset.imageIds.map(imageId => ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, {
        imageId
      })));
    }

    if (args.archived !== undefined) {
      await ctx.db.patch(args.presetId, { archived: args.archived });
    }
  }
})