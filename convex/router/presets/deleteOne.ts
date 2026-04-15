import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { authMutation, internalMutation, MutationCtx } from "../../procedures";

const handler = async (ctx: MutationCtx, args: { id: Id<'presets'>, onlyIfArchived?: boolean }) => {
  const preset = await ctx.db.get(args.id);
  if (!preset) throw new Error("Preset not found");
  if (args.onlyIfArchived && !preset.archived) throw new Error("Preset is not archived");

  // Check if preset has been used to generate images, if so, prevent deletion
  const generations = await ctx.db.query("presetGenerations")
    .withIndex("by_preset_id", q => q.eq("presetId", args.id)).first();
  if (generations) throw new Error("Cannot delete a preset that has been used to generate images");

  // Delete all associated images
  await Promise.all(preset.imageIds.map(imageId => ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, {
    imageId
  })));

  // Delete all associated depth maps
  await Promise.all(preset.depthMaps.map(imageId => ctx.scheduler.runAfter(0, internal.router.storage.images.deleteOne._internal, {
    imageId
  })));

  // Delete all associated categories
  const categories = await ctx.db.query("presetCategories")
    .withIndex("by_preset_id", q => q.eq("presetId", args.id)).collect();
  await Promise.all(categories.map(category => ctx.db.delete(category._id)));

  await ctx.db.delete(args.id);
}

export const _internal = internalMutation({
  args: {
    id: v.id("presets"),
    onlyIfArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await handler(ctx, args);
  }
})

export const authed = authMutation({
  args: {
    id: v.id("presets"),
  },
  handler: async (ctx, args) => {
    return await handler(ctx, args);
  }
})