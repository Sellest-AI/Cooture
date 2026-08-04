import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { internalMutation, MutationCtx, ownedMutation } from "../../procedures";

const handler = async (ctx: MutationCtx, args: { id: Id<'presets'>, onlyIfArchived?: boolean }) => {
  const preset = await ctx.db.get(args.id);
  if (!preset) throw new Error("Preset not found");
  if (args.onlyIfArchived && !preset.archived) return false;

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

  return true;
}

export const _internal = internalMutation({
  args: {
    id: v.id("presets"),
    onlyIfArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<boolean> => {
    return await handler(ctx, args);
  }
})

/**
 * `authMutation` here only checked that *someone* was signed in, so any authenticated
 * caller could delete any preset by id (03-FLAWS F6). `ownedMutation` supplies the same
 * `{ id }` argument but resolves and authorises the document before the handler runs —
 * there is no path into this handler with a preset the caller does not own.
 */
export const authed = ownedMutation("presets")({
  // `args: {}` is required: the customization declares `{ id }` itself, and convex-helpers
  // refuses to build a function that does not also declare its own args.
  args: {},
  handler: async (ctx): Promise<boolean> => {
    return await handler(ctx, { id: ctx.doc._id });
  }
})