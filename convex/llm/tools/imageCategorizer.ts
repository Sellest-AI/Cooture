import { z } from "zod";
import { PRESET_CATEGORY_VALUES } from "../../schema/presets";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool, wrapAgent } from "../utils";

const INSTRUCTIONS = `You are an expert at analyzing preset images and categorizing them.

Analyze the image and return ALL applicable categories with confidence scores (0-1).

Categories details:

**Subject Count:**
- SOLO: Single subject
- DUO: Two subjects
- TRIO: Three subjects
- GROUP: Four or more subjects

**Location/Environment:**
- STUDIO: Professional studio setting
- NATURE: Outdoor natural settings (forests, fields, mountains)
- CITY: Urban environments (streets, buildings)
- BEACH: Beach/coastal settings
- INDOOR: Indoor non-studio settings (homes, cafes)
- STREET: Street photography style

**Style/Aesthetic:**
- CASUAL: Candid, phone-shot style
- FORMAL: Professional, posed
- VINTAGE: Retro, film-like aesthetic
- EDITORIAL: Magazine-style fashion shots
- CANDID: Natural, unposed moments
- ARTISTIC: Creative, experimental

**Purpose:**
- ENTERPRISE: Corporate/business use (white background, professional attire)
- HEADSHOT: Face-focused professional portraits
- LIFESTYLE: Everyday life scenarios
- FASHION: Fashion-focused shots
- SOCIAL_MEDIA: Optimized for social platforms
- COMMERCIAL: Product/brand oriented

**Technical/Special:**
- TRICKS: Uses photographic tricks (forced perspective, mirrors, etc.)
- DRAMATIC_LIGHTING: High-contrast, moody lighting
- NATURAL_LIGHT: Soft, natural lighting
- FLASH: Flash photography style
- BLACK_WHITE: Black and white or monochrome
- GOLDEN_HOUR: Warm sunset/sunrise lighting

**Shot Composition:**
- FULL_BODY: Full body visible
- HALF_BODY: Waist up
- CLOSEUP: Face/upper body close shots
- ACTION: Dynamic movement shots
- POV: Point of view shots

**Mood:**
- MOODY: Dark, atmospheric
- BRIGHT: Light, airy
- PLAYFUL: Fun, energetic
- SERIOUS: Formal, composed
- ROMANTIC: Soft, intimate

FULL LIST OF CATEGORIES:
${PRESET_CATEGORY_VALUES.map(c => `- ${c}`).join('\n')}

For subject count, pick exactly ONE (the most accurate one).
For other dimensions, multiple categories can apply.`;

const ReturnCategorySchema = z.array(z.object({
  name: z.enum(PRESET_CATEGORY_VALUES),
  confidence: z.number().min(0).max(1),
}));

export const imageCategorizer = createTool({
  description: "Return the categories of a preset image with confidence scores.",
  args: z.object({
    imageUrl: z.string(),
  }),
  handler: async (ctx, args) => {
    const result = await wrapAgent(defaultAgent).generateObject(ctx, { userId: ctx.userId }, {
      providerOptions: models.vision.smart.providerOptions({ effort: 'none' }),
      model: models.vision.smart.model,
      system: INSTRUCTIONS,
      prompt: [
        {
          role: 'user',
          content: [
            { type: 'image', image: args.imageUrl },
            {
              type: 'text',
              text: `Analyze this preset image and return all applicable categories.
              
Think step by step:
1. How many subjects are clearly visible? (Pick ONE from SOLO/DUO/TRIO/GROUP)
2. What is the location/environment?
3. What is the shooting style and aesthetic?
4. What would this be used for?
5. What are the technical/lighting characteristics?
6. What is the shot composition?
7. What is the mood/vibe?

Return only categories with confidence >= 0.4`
            }
          ]
        }
      ],
      output: "object",
      maxRetries: 5,
      schema: ReturnCategorySchema,
    }, { storageOptions: { saveMessages: 'none' } });

    const categories = result.object;

    return categories;
  }
})