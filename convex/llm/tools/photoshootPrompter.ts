import { z } from "zod";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool } from "../utils";

const INSTRUCTIONS = `You are an expert photography prompt engineer specializing in converting structured schemas into highly detailed, production-ready image generation prompts.

Your task is to transform a JSON schema into a comprehensive, natural-language prompt that image generation models can understand and execute flawlessly.

CRITICAL RULES:
1. **Preserve ALL details** from the schema - nothing should be omitted
2. **Reference images precisely** - use exact image numbers (e.g., "Use image 2 for...")
3. **Follow logical prompt structure** - composition first, then subjects, environment, style, technical
4. **Be specific and unambiguous** - avoid vague terms, use exact descriptions
5. **Emphasize important elements** - outfit references, subject appearances, depth maps must be explicitly mentioned
6. **Natural flow** - write in natural language, not bullet points or JSON-like text

OUTPUT STRUCTURE (follow this order):
1. SCENE & COMPOSITION - Overall scene, shot type, camera angle, framing, focus
2. SUBJECTS - Each subject's pose, position, expression, gaze, outfit (with references)
3. ENVIRONMENT - Location, background, surrounding elements, spatial arrangement
4. STYLE & LIGHTING - Aesthetic, lighting quality, color palette, texture, mood
5. TECHNICAL - Camera settings, focal length, post-processing, grain/effects
6. IMAGE REFERENCES - Explicit instructions for each reference image

EXAMPLE PROMPT STRUCTURE:
"A full-body fashion photograph shot from a low angle... [composition]. The subject stands in a three-quarter pose... [subject details]. Use image 1 for the subject's face and skin tone... [references]. They wear a black leather jacket... Use image 2 for the jacket... [outfit with references]. The scene is set in an urban street... [environment]. Dramatic side lighting with deep shadows... [style]. Shot with 85mm lens, f/1.8 aperture... [technical]. Subtle film grain overlay... [effects]."

Remember: The prompt should read like a professional photography brief, not a structured document.`;

/** @deprecated It alters the original JSON details, so we don't use it for now. */
export const photoshootPrompter = createTool({
  description: "Take a schema and return a detailed prompt for generating a photoshoot preset image that fits the schema.",
  args: z.object({
    schema: z.any(),
  }),
  handler: async (ctx, args) => {
    const schemaString = JSON.stringify(args.schema, null, 2);

    const result = await defaultAgent.generateText(ctx, { userId: ctx.userId }, {
      providerOptions: models.vision.smart.providerOptions({ effort: 'none' }),
      model: models.vision.smart.model,
      system: INSTRUCTIONS,
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `PHOTOSHOOT SCHEMA:
${schemaString}`
            },
            {
              type: 'text',
              text: `Convert the above schema into a comprehensive, production-ready image generation prompt.

Ensure ALL details are included, with special attention to:
- Image references (subjects with "reference" fields, outfit item references)
- Outfit details and which specific image to use for each clothing item
- Depth map references (if present in composition)
- Subject characteristics (position, pose, expression, gaze, gender, height)
- Environment, style, lighting, and technical specifications

Output ONLY the final prompt text as natural language - no JSON, no bullet points, no meta-commentary.`
            }
          ]
        }
      ],
      maxRetries: 5,
    }, { storageOptions: { saveMessages: 'none' } });

    const prompt = result.text;

    return prompt;
  }
})