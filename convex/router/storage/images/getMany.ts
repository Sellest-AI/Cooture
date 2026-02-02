import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { getImage } from "../../../functions/images";
import { publicQuery } from "../../../procedures";

const args = {
  imageIds: v.array(v.id('images')),
}

export const anon = publicQuery({
  args, handler: async (ctx, args) => {
    const images = await Promise.all(Array.from(new Set(args.imageIds)).map(id => getImage(ctx, id)));
    return images.filter(notEmpty);
  }
});