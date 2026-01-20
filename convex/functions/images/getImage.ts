import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../_generated/server";
import { sanitizeImage } from "../../lib/image/sanitizeImage";

type AuthQueryCtx = QueryCtx & { user?: { _id: Id<'users'> } }

export const getImage = async (ctx: AuthQueryCtx, id: Id<'images'>) => {
  const [image, sizes] = await Promise.all([
    ctx.db.get(id),
    ctx.db.query("imageSizes").withIndex("by_image_id", q => q.eq("imageId", id)).collect(),
  ]);

  if (!image) return null;

  return sanitizeImage({
    ...image,
    sizes,
  });
}

export const getImageWithObjects = async (ctx: AuthQueryCtx, id: Id<'images'>) => {
  const [image, sizes, objects] = await Promise.all([
    ctx.db.get(id),
    ctx.db.query("imageSizes").withIndex("by_image_id", q => q.eq("imageId", id)).collect(),
    ctx.db.query("imageObjects").withIndex("by_base_image_id", q => q.eq("baseImageId", id)).collect(),
  ]);

  if (!image) return null;

  return sanitizeImage({
    ...image,
    sizes,
    objects,
  });
}

export type GetImageDoc = Awaited<ReturnType<typeof getImage>>;
export type GetImageWithObjectsDoc = Awaited<ReturnType<typeof getImageWithObjects>>;