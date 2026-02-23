"use node"
import { parseReplicateRunOutput, replicate } from "@/lib/replicate/node";
import { faker } from "@faker-js/faker";
import { addBase64Header, bufferToBase64 } from "@shared/node/images";
import sharp from "sharp";
import { z } from "zod";
import { createTool } from "../utils";

export const profilePictureGenerator = createTool({
  description: "Generate a profile picture based on user's face",
  args: z.object({
    imageUrl: z.string()
  }),
  handler: async (ctx, args) => {
    const dayNight = faker.helpers.arrayElement(['Day', 'Night']);
    const place = faker.helpers.arrayElement([
      'sitting on a bench in a park',
      'standing in a busy street',
      'sitting in a cafe',
      'standing in front of a graffiti wall',
      'sitting on the stairs of a building',
      'standing in a neon-lit alley',
      'sitting on a rooftop with city view',
      'standing in a subway station',
      'sitting on a chair in a minimalist room',
      'standing in a crowded market',
    ])

    const action = faker.helpers.arrayElement([
      'the person extends their arm toward the frame',
      'the person put one hand in their hair',
      'the person crosses their arms',
      'the person looks down with a smile',
      'the person tilt their head to the side',
      'the person has a hand on their chin as if thinking',
      'the person has one hand in their pocket and the other hanging by their side',
      'the person is adjusting their jacket collar with one hand',
      'the person is holding a coffee cup with both hands',
      'the person is looking over their shoulder towards the camera',
      'the person is making a peace sign with their fingers',
    ])

    const outfit = faker.helpers.arrayElement([
      'wearing a leather jacket and sunglasses',
      'wearing a hoodie and a beanie',
      'wearing a denim jacket and a scarf',
      'wearing a turtleneck sweater and a coat',
      'wearing a graphic t-shirt and a bomber jacket',
      'wearing a blazer and a fedora',
      'wearing a flannel shirt and a vest',
      'wearing a trench coat and a beret',
      'wearing a varsity jacket and a baseball cap',
      'wearing a long coat and a wide-brimmed hat',
    ]);

    const prompt = `
Long shot, person with face of (image 1) ${place}, ${action}, ${outfit}. f/8 aperture, 35mm lens, everything sharp foreground to background, in Asia Neon, fully in focus, undersaturated colors, VERY high ISO grain, noise, handheld snapshot, flat focus, no depth of field effect. VERY Low contrast. ${dayNight} Shot. Phone Flash
`.trim();

    const object = await replicate.run("prunaai/p-image-edit", {
      input: {
        aspect_ratio: "1:1",
        prompt: prompt,
        images: [args.imageUrl],
        turbot: false,
      }
    })

    const outputs = await parseReplicateRunOutput(object);
    const outputBuffer = await outputs[0]?.toBuffer();

    // Take the output, resize it to 192x192, add grain and return a base64 string
    if (!outputBuffer) throw new Error("Failed to generate profile picture");

    // Random between 0.9 & 1.1
    const brightness = 0.9 + Math.random() * 0.2;
    //  Random between 0.8 & 1.0
    const saturation = 0.8 + Math.random() * 0.2;

    const picture = await sharp(outputBuffer)
      .resize(192, 192)
      .composite([{
        input: await sharp({
          create: {
            width: 192,
            height: 192,
            channels: 3,
            background: 'black',
            noise: {
              type: 'gaussian',
              mean: 64,
              sigma: 10
            }
          }
        }).toFormat('raw').toBuffer({ resolveWithObject: true }).then(({ data, info }) =>
          sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).toFormat('png').toBuffer()
        ),
        blend: 'overlay'
      }])
      .sharpen()
      .modulate({
        brightness: brightness,
        saturation: saturation,
      })
      .linear(0.85, 15)
      .toFormat('webp')
      .toBuffer();

    return addBase64Header(bufferToBase64(picture), 'webp');
  }
});