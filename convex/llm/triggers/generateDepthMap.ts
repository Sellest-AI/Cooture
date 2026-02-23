"use node";
import { parseReplicateRunOutput, replicate, sanitizeImageForReplicate } from "@/lib/replicate/node";
import { bufferToBase64 } from "@shared/node/images";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { internalAction } from "../../_generated/server";

export const _internal = internalAction({
  args: {
    url: v.string(),
    userId: v.union(v.null(), v.id("users"))
  },
  handler: async (ctx, { url, userId }): Promise<Id<'images'>> => {
    const _image = await sanitizeImageForReplicate(url);
    const output = await replicate.run(
      "zedge/zoedepth:fd85428545f04150f59856dab2a51a7be2ca5003a331920b0e4303b17b411332",
      {
        input: { image: _image.url }
      }
    );

    const outputs = await parseReplicateRunOutput(output);
    const buffer = await outputs[0]?.toBuffer();
    const base64 = buffer ? bufferToBase64(buffer) : null;

    if (!base64) { throw new Error("Failed to generate depth map"); }

    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [{ base64 }],
      userId: userId || null
    });

    return images[0]._id;
  }
})