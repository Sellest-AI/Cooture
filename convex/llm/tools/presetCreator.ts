import { z } from "zod";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool } from "../utils";

// --- REUSABLE INSTRUCTION STRINGS ---
const NO_CLOTHING = "Describe visual elements only. Do NOT describe the subject's clothes, colors of clothes, or fashion brands here.";
const NO_BODY = "Do NOT describe the person's body or pose here. Focus on the background/surroundings only.";

const INSTRUCTIONS = `You are an expert Creative Director and AI Prompt Engineer specializing in reverse-engineering photography.

YOUR GOAL: 
Analyze the visual input and extract a structured JSON preset used to recreate the image style. 

*** QUALITY REQUIREMENT: EXTREME DETAIL ***
- **Do NOT provide short, one-word answers.** 
- Be descriptive, evocative, and precise. 
- Use specific terminology (e.g., instead of "red", say "vibrant crimson"; instead of "jacket", say "distressed leather motorcycle jacket with silver hardware").
- Imagine you are describing this to a blind artist who must paint it perfectly.

CRITICAL ARCHITECTURE RULES (STRICT ENFORCEMENT):
This JSON is used in a pipeline where the User and the Outfit can be swapped independently. You must separate concerns:

1. GENDER-NEUTRAL LANGUAGE (ABSOLUTE REQUIREMENT):
   - NEVER use gendered terms: "woman", "man", "girl", "boy", "male", "female", "she", "he", "her", "him", "his", "hers".
   - ALWAYS use: "the subject", "the person", "the individual", "they", "their".
   - WHY: This preset will be used by people of ANY gender. Gendered descriptions will force gender transformation in the output.
   - Example: Instead of "woman leaning against wall", write "subject leaning against wall".

2. NO "GHOST" CLOTHING: 
   - NEVER describe clothing colors, specific garments, or brands in 'sceneDescription', 'subject', or 'environment'. 

3. SUBJECT vs. OUTFIT:
   - 'subject': Describes the biological human, their pose, muscle tension, and expression.
   - 'outfit': Contains ALL fashion information.

4. PROPS vs. ACCESSORIES:
   - Worn = 'outfit.accessories'. 
   - Held/Interacted = 'subject.heldObjects' or 'environment.surroundingElements'.

5. VISIBILITY & CROPPING (ABSOLUTE RULES YOU MUST FOLLOW):
  - If a body part or clothing item is cut off by the frame, RETURN undefined (the JavaScript token) for that optional field. Do NOT invent or describe it.
  - If shoes are not visible, shoes: undefined.
  - If top or bottom clothing is not visible, top: undefined, bottom: undefined.
  - DO NOT return strings like "N/A", "NONE", "UNDEFINED", "NULL" OR text explanations as values.
  - DO NOT return empty placeholder objects (e.g., {}) to indicate invisibility.
  - For list fields where nothing is present, return the empty array token [] (not the string "[]").
  - Use the literal JavaScript tokens: undefined (unquoted) for missing optionals, and [] for empty lists.
  - Do NOT guess. If you cannot confidently see it, set it to undefined or [] as required.

OUTPUT FORMAT (VERY IMPORTANT):
- Return a JSON object that exactly matches the schema structure.
- Use plain strings for textual fields, arrays for lists, nested objects only when visible and describable.
- For any optional object/field that is not visible, set it to the literal token: undefined
- For arrays with no items visible, set to: []
- Do not quote undefined or [].
- Examples:
  BAD:
   bottom: { details: "Obscured by table." }
   shoes: "N/A"
   accessories: "none"
  GOOD:
   bottom: undefined
   shoes: undefined
   accessories: []

Follow these rules exactly. The consumer of this object expects literal undefined tokens for missing optionals and [] for empty lists.
`;


export const ImagePresetSchema = z.object({
  // --- SCENE ---
  sceneDescription: z.string().min(300).describe(
    `The core concept/action. MUST describe the scene as if the subject were wearing a neutral grey suit or naked. Do NOT mention specific garments except held objects. ${NO_CLOTHING}`
  ),

  // --- 2. STYLE (ARTISTIC DIRECTION) ---
  style: z.object({
    aesthetic: z.string().describe("The vibe: e.g., 'Flash photography', 'Y2K Streetwear', 'Candid snapshot', 'Accidental Renaissance'."),
    lighting: z.string().describe("Light qualities: e.g., 'Hard direct flash', 'Neon background ambient', 'Nighttime mixed lighting'."),
    colorPalette: z.string().describe("Dominant colors (excluding outfit): e.g., 'Dark street tones', 'Bright neon green and red accents', 'High contrast blacks'."),
    texture: z.string().describe("Surface details: e.g., 'Digital noise', 'Wet pavement reflection', 'Skin sheen'."),
  }),

  // --- 3. ENVIRONMENT (WORLD) ---
  environment: z.object({
    location: z.string().describe("The setting: e.g., 'Urban street corner', 'Outside convenience store'."),
    backgroundDetails: z.string().describe(`Specific objects behind the subject. Example: 'Sliding glass doors with neon Open signs'. ${NO_BODY}`),
    surroundingElements: z.array(z.string()).describe(
      "Objects captured in the background/foreground. Example: ['Green and orange convenience store sign', 'Wet asphalt']."
    ),
  }),

  // --- SUBJECT (PHYSICALITY) ---
  subject: z.object({
    position: z.string().describe("General stance: e.g., 'Sitting', 'Standing', 'Jumping'."),
    bodyAlignment: z.string().describe("Relation to camera: e.g., 'Frontal', 'Profile', 'Three-quarter turn'."),
    legs: z.array(z.string()).describe("Leg positions. Example: ['Right leg bent at knee', 'Left leg straight supporting weight']."),
    hands: z.array(z.string()).describe("Hand positions. Example: ['Right arm extended forward toward lens', 'Left arm hanging by side']."),
    heldObjects: z.array(z.string()).describe(
      "Items strictly held in hands. Example: ['Red and white beverage can']. Do NOT include bags/purses here (those are accessories)."
    ),
    head: z.object({
      direction: z.enum(["front", "side"]).describe("Orientation: 'front' or 'side'."),
      angle: z.string().describe("Head tilt: e.g., 'Tilted to the side', 'Chin up'."),
      expression: z.string().describe("Facial emotion: e.g., 'Winking eye', 'Puckered lips', 'Playful'."),
      gaze: z.string().describe("Eye direction: e.g., 'Looking at camera'."),
    })
  }),

  // --- 5. COMPOSITION (FRAMING) ---
  composition: z.object({
    shotType: z.string().describe("Size: e.g., 'Medium Shot', 'POV'."),
    cameraAngle: z.string().describe("Height: e.g., 'Eye level', 'Slightly high angle'."),
    cameraPosition: z.string().describe("Camera position relative to subject: e.g., 'Frontal', 'Three-quarter left', 'Three-quarter right', 'Profile', 'From behind'."),
    subjectPlacement: z.string().describe("Subject position in frame: e.g., 'Centered', 'Left third of frame', 'Right side', 'Off-center right'."),
    focus: z.string().describe("Depth: e.g., 'Deep focus', 'Subject sharp, background slightly visible'."),
    photographicTricks: z.array(z.string()).describe("List of optical illusions or camera tricks used. Examples: 'Giant hand in extreme foreground creating forced perspective illusion', 'Mirror reflection trick', 'Tilt-shift miniature effect', 'Double exposure blend'. If no special tricks are used, return empty array."),
    backgroundOrientation: z.string().describe("Orientation of background elements (especially moving ones like trains, cars, crowds) relative to camera. E.g., 'Parallel/Horizontal - train moving left to right across frame', 'Three-quarter angle - train receding into distance', 'Perpendicular - train coming toward/away from camera'. Important for perspective lines."),
  }),

  // --- 6. TECHNICAL (RENDERING) ---
  technical: z.object({
    camera: z.string().describe("Simulated Gear: e.g., 'iPhone camera', 'Point-and-shoot film'."),
    postProcessing: z.string().describe("Grading: e.g., 'Flash photo look', 'Slightly overexposed highlight', 'Raw'."),
    focalLength: z.string().describe("Lens: e.g., '28mm wide angle'."),
  }),

  // --- 7. OUTFIT (ISOLATED FOR SWAPPING) ---
  outfit: z.object({
    description: z.string().describe("Summary of the look. REQUIRED: Include fit and vibe."),

    top: z.object({
      type: z.string().describe("Category: e.g., 'Crop top', 'T-shirt'.").optional(),
      details: z.string().describe("Specifics: e.g., 'Black cotton, red logo graphic on chest, ultra-short fit'.")
        .optional(),
    }).optional().describe("If not visible, return undefined."),

    bottom: z.object({
      type: z.string().describe("Category: e.g., 'Cargo pants', 'Jeans'.").optional(),
      details: z.string().describe("Specifics: e.g., 'Black baggy fit, low rise waist'.")
        .optional(),
    }).optional().describe("If not visible, return undefined."),

    // Useful for managing 'tucked in' styles or visible branding on waistbands
    innerLayer: z.string().optional().describe("Visible layers underneath: e.g., 'White elastic boxer waistband showing'."),

    outerwear: z.object({
      type: z.string().describe("Category: e.g., 'Jacket', 'Hoodie'.").optional(),
      details: z.string().describe("Specifics: e.g., 'Black zip-up hoodie, slightly oversized fit'.")
        .optional(),
    }).optional().describe("If not visible, return undefined."),

    accessories: z.array(z.record(z.string(), z.string())).describe("Worn items (Glasses, Necklace, Hat). If none, return []."),

    shoes: z.string().optional().describe("If feet are not visible, return undefined."),
  }),
});

export const presetCreator = createTool({
  description: "Generate the preset schema from an image.",
  args: z.object({
    imageUrl: z.string(),
  }),
  handler: async (ctx, args) => {
    const result = await defaultAgent.generateObject(ctx, { userId: ctx.userId }, {
      providerOptions: models.vision.smartest.providerOptions({ effort: 'high' }),
      model: models.vision.smartest.model,
      system: INSTRUCTIONS,
      prompt: [
        {
          role: 'user',
          content: [
            { type: 'image', image: args.imageUrl },
            {
              type: 'text',
              // I added a 'Thinking Process' instruction here to force the model to categorize correctly
              text: `Analyze this image to create a reusable generation preset.
              
              Follow these priorities:
              1. DETACH the clothing from the scene description. The scene description must work even if the subject was naked.
              2. VISIBILITY CHECK: Is the subject full body? Waist up? Headshot? If a body part or clothing item is cut off by the frame, return 'undefined'. Do NOT guess.
              3. IDENTIFY strictly what is a 'Prop' (Environment/Subject) vs what is 'Fashion' (Outfit).
              4. CLASSIFY the lighting and camera angle using technical photography terms.
              
              Fill the schema comprehensively.`
            }
          ]
        }
      ],
      output: "object",
      maxRetries: 5,
      schema: ImagePresetSchema,
    }, { storageOptions: { saveMessages: 'none' } });


    // sanitize (loop through and fix any issues)
    // check for any string "undefined" or "[]" in the result and fix them
    const sanitize = <T>(obj: T): T => {
      if (typeof obj === 'string') {
        if (obj === 'undefined') return undefined as T;
        if (obj === '[]') return [] as T;
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize) as T;
      }
      if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = sanitize(obj[key]);
        }
        return newObj;
      }

      return obj;
    }

    const object = sanitize(result.object);

    const outfit = {
      ...object.outfit,
      top: object.outfit.top?.details && object.outfit.top.type ? {
        type: object.outfit.top.type,
        details: object.outfit.top.details,
      } : undefined,
      bottom: object.outfit.bottom?.details && object.outfit.bottom.type ? {
        type: object.outfit.bottom.type,
        details: object.outfit.bottom.details,
      } : undefined,
      outerwear: object.outfit.outerwear?.details && object.outfit.outerwear.type ? {
        type: object.outfit.outerwear.type,
        details: object.outfit.outerwear.details,
      } : undefined,
    }

    return {
      ...object,
      outfit,
    }
  }
})