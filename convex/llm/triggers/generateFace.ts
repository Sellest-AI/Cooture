"use node"
import { parseReplicateRunOutput, replicate } from "@/lib/replicate/node";
import { notEmpty } from "@shared/utils";
import { v } from "convex/values";
import { adminAction } from "../../procedures";
import { faceGenerator } from "../tools/faceGenerator";
import { profilePictureGenerator } from "../tools/profilePictureGenerator";

export const admin = adminAction({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    gender: v.optional(v.string()),
    size: v.optional(v.string()),
    skinTone: v.optional(v.string()),
    heightCm: v.optional(v.number()),
    age: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const toolCtx = {
      runQuery: ctx.runQuery,
      runMutation: ctx.runMutation,
      scheduler: ctx.scheduler,
      runAction: ctx.runAction,
      auth: ctx.auth,
      storage: ctx.storage,
      vectorSearch: ctx.vectorSearch,
      userId: ctx.userId,
    }

    const result = await faceGenerator.handler(toolCtx, {
      firstName: args.firstName,
      lastName: args.lastName,
      gender: args.gender,
      weight: args.size,
      skinTone: args.skinTone,
      heightCm: args.heightCm,
      age: args.age,
    });

    const INSTRUCTIONS = (side: string, markdown: string) => `
    BACKGOUND: WHITE BACKGROUND
    COMPOSITION: ${side === 'smiling' ? 'TEETH SMILING FACE' : 'RESTING FACE'} ${side === 'side' ? 'FACING LEFT' : ''}, ${side === 'side' ? 'SIDE PROFILE LATERAL VIEW' : 'FRONT'} SHOT PICTURE
    SHOT: CLOSE-UP ON FULL HEAD, HAIR AND SHOULDERS IN FRAME

    CLOTHES: White tshirt
    ${markdown}`.trim();

    const baseImages = await Promise.all(['front', 'side', 'smiling', 'profile'].map(async (side) => {
      if (side === 'profile') return null;

      const object = await replicate.run("prunaai/z-image-turbo", {
        input: {
          width: 768,
          height: 1024,
          prompt: INSTRUCTIONS(side, result.markdown),
          go_fast: false,
          output_format: "webp",
          output_quality: 100,
          num_inference_steps: 8,
        }
      })

      const outputs = await parseReplicateRunOutput(object);
      const output = await outputs[0]?.toUrl();

      if (!output) return null;

      return {
        side,
        url: output,
      }
    }))

    const frontImage = baseImages.find(i => i?.side === 'front');
    if (!frontImage?.url) throw new Error("Failed to generate front image");

    const profilePicture = await profilePictureGenerator.handler(toolCtx, {
      imageUrl: frontImage.url,
    })

    const images = [...baseImages, { side: 'profile', base64: profilePicture }].filter(notEmpty);

    return {
      ...result,
      images,
    };
  }
})