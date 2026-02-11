import { v } from "convex/values";
import { getImageWithObjects } from "../../../functions/images";
import { internalMutation } from "../../../procedures";

/** 
 * INTERNAL ONLY. Do not call directly. Use deleteOne action instead.
 */
export const _internal = internalMutation({
  args: {
    imageId: v.id("images")
  },
  handler: async (ctx, { imageId }) => {
    const image = await getImageWithObjects(ctx, imageId);
    if (!image) return;

    await Promise.all(image._sizes.map((size) => ctx.db.delete("imageSizes", size._id)));
    await Promise.all(image.objects.map((object) => ctx.db.delete("imageObjects", object._id)));
    await ctx.db.delete("images", imageId);

    let imageUsers = await ctx.db.query("userImages")
      .withIndex("by_image_id", (q) => q.eq("imageId", imageId)).collect();
    for await (const imageUser of imageUsers) {
      await ctx.db.delete("userImages", imageUser._id);
    }
  },
})