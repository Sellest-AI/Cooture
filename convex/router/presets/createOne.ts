import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { adminAction, internalMutation } from "../../procedures";
import { PRESET_PROMPT } from "../../schema/presets";

export const admin = adminAction({
  args: {
    name: v.string(),
    base64: v.string(),
  },
  handler: async (ctx, { name, base64 }) => {
    const images = await ctx.runAction(internal.router.storage.images.uploadMany._internal, {
      images: [{ base64 }],
      userId: null
    })

    const prompts = await Promise.all(images.map((img) => ctx.runAction(internal.llm.triggers.presetCreator._internal, {
      userId: ctx.userId,
      imageId: img._id
    })))

    await ctx.runMutation(internal.router.presets.createOne._internal_mutation, {
      name,
      imageIds: images.map((img) => img._id),
      prompts: prompts,
    })
  }
})

export const _internal_mutation = internalMutation({
  args: {
    name: v.string(),
    imageIds: v.array(v.id("images")),
    prompts: v.array(PRESET_PROMPT),
  },
  handler: async (ctx, { name, imageIds, prompts }) => {
    const presetId = await ctx.db.insert("presets", {
      name,
      imageIds,
      prompts,
      archived: false,
    })

    return presetId;
  }
})