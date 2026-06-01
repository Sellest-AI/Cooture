import { z } from "zod";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool, wrapAgent } from "../utils";

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

1. MULTIPLE SUBJECTS (ARRAY HANDLING):
   - Most scenes have ONE subject. Return a single-element array: [{ subject details }].
   - ONLY use multiple subjects if there are 2+ clearly identifiable humans in the scene who are BOTH focal points.
   - A crowd, blurred people in background, or partially visible bystanders are NOT subjects - they belong in 'environment.surroundingElements'.
   - Each subject in the array gets their own complete description: position, body, head, AND outfit.
   - Example: Two friends posing together = 2 subjects. Subject + blurred crowd behind = 1 subject (crowd in environment).

2. GENDER-NEUTRAL LANGUAGE (ABSOLUTE REQUIREMENT):
   - NEVER use gendered terms: "woman", "man", "girl", "boy", "male", "female", "she", "he", "her", "him", "his", "hers".
   - ALWAYS use: "the subject", "the person", "the individual", "they", "their", OR positional identifiers like "subject on left", "taller subject", "subject in foreground".
   - WHY: This preset will be used by people of ANY gender. Gendered descriptions will force gender transformation in the output.
   - Example: Instead of "woman leaning against wall", write "subject leaning against wall".

3. NO "GHOST" CLOTHING: 
   - NEVER describe clothing colors, specific garments, or brands in 'sceneDescription' or 'environment'. 

4. SUBJECT vs. OUTFIT:
   - 'subject': Describes the biological human, their pose, muscle tension, and expression.
   - 'outfit' (nested inside each subject): Contains ALL fashion information for that specific subject.

5. PROPS vs. ACCESSORIES:
   - Worn = 'outfit.accessories'. 
   - Held/Interacted = 'subject.heldObjects' or 'environment.surroundingElements'.

6. VISIBILITY & CROPPING (ABSOLUTE RULES YOU MUST FOLLOW):
  - If a body part or clothing item is cut off by the frame, RETURN undefined (the JavaScript token) for that optional field. Do NOT invent or describe it.
  - If shoes are not visible, shoes: undefined.
  - If top or bottom clothing is not visible, top: undefined, bottom: undefined.
  - DO NOT return strings like "N/A", "NONE", "UNDEFINED", "NULL" OR text explanations as values.
  - DO NOT return empty placeholder objects (e.g., {}) to indicate invisibility.
  - For list fields where nothing is present, return the empty array token [] (not the string "[]").
  - Use the literal JavaScript tokens: undefined (unquoted) for missing optionals, and [] for empty lists.
  - Do NOT guess. If you cannot confidently see it, set it to undefined or [] as required.

CONTENT RATING FOR THE SCENE:
- SAFE = Appropriate for all audiences
- SUGGESTIVE = Implicit posing or clothing or weaponry, but not explicit.
- EXPLICIT = Highly revealing or explicit poses or clothing. Still safe to share online.
- NSFW = When the image contains highly revealing, fetish wear, or explicit content. Use this rating only for images that are clearly adult in nature.
When in doubt about content rating, default to the most conservative option.

NOTES:
- Unless the image IS black & white, do not EVERY mention "black and white" in the "composition" or "style" fields.
- Avoid using terms like "disposable camera", "film point-and-shoot snapshot", or "polaroid" in the "style" or "technical" fields unless the image physically has white borders. Instead, use "raw candid flash photograph, digital capture", "35mm lens, handheld flash photography", or "compact camera, direct flash" to prevent the model from hallucinating framing borders.
- Strict separation of wearable items vs props: Never list fashion accessories (hats, gloves, purses, bags) in "hands" or "heldObjects". These belong exclusively in "outfit.accessories". "heldObjects" is strictly for environmental props. Examples of valid heldObjects: "Bouquet of flowers, coffee cup, book, phone, skateboard".
- NEVER describe natural skin tones or textures (e.g., "fair", "dark", "smooth skin", "neutral tones"). This is strictly prohibited to prevent bias. ONLY mention skin color if it is vividly unnatural or fantastical (e.g., blue, green, purple, metallic).

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
    `The core concept/action. MUST describe the scene as if the subject(s) were wearing a neutral grey suit or naked. Do NOT mention specific garments except held objects. ${NO_CLOTHING}`
  ),

  sceneDescriptionShort: z.string().min(60).describe(
    `A consise version of the secene description. It will be used to understand the core concept of the image (Camera, Subjects Pose, Environment) without the influence of fashion details. It should be a short paragraph (1-3 sentences) that captures the essence of the scene.`
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
    backgroundDetails: z.string().describe(`Specific objects behind the subject(s). Example: 'Sliding glass doors with neon Open signs'. ${NO_BODY}`),
    surroundingElements: z.array(z.string()).describe(
      "Objects captured in the background/foreground. Example: ['Green and orange convenience store sign', 'Wet asphalt']. Include non-focal people here (crowds, blurred bystanders)."
    ),
  }),

  // --- 4. SUBJECTS (PHYSICALITY) ---
  // Usually contains ONE subject. Only use multiple if there are 2+ clearly identifiable focal humans.
  // Crowds/blurred people belong in environment.surroundingElements.
  subjects: z.array(z.object({
    gender: z.enum(['male', 'female']).describe('Only field that can be gendered because it is used for pronoun purposes.'),
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
    }),
    // --- OUTFIT (ISOLATED FOR SWAPPING) ---
    // Each subject has their own outfit. This allows swapping outfits independently per subject.
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

      legwear: z.object({
        type: z.string().describe("Category: e.g., 'Tights', 'Stockings', 'Socks'.").optional(),
        details: z.string().describe("Specifics: e.g., 'Black sheer patterned tights'.")
          .optional(),
      }).optional().describe("If not visible, return undefined."),

      // Useful for managing 'tucked in' styles or visible branding on waistbands
      innerLayer: z.string().optional().describe("Visible layers underneath: e.g., 'White elastic boxer waistband showing'."),

      outerwear: z.object({
        type: z.string().describe("Category: e.g., 'Jacket', 'Hoodie'.").optional(),
        details: z.string().describe("Specifics: e.g., 'Black zip-up hoodie, slightly oversized fit'.")
          .optional(),
      }).optional().describe("If not visible, return undefined."),

      accessories: z.array(z.record(z.string(), z.string())).describe("Worn items (Glasses, Necklace, Hat, Cap). If none, return []."),

      shoes: z.string().optional().describe("If feet are not visible, return undefined."),
    }),
  })),

  // --- 5. COMPOSITION (FRAMING) ---
  composition: z.object({
    shotType: z.string().describe("Size: e.g., 'Medium Shot', 'POV'."),
    cameraAngle: z.string().describe("Height: e.g., 'Eye level', 'Slightly high angle'."),
    cameraPosition: z.string().describe("Camera position relative to subject(s): e.g., 'Frontal', 'Three-quarter left', 'Three-quarter right', 'Profile', 'From behind'."),
    subjectsPlacement: z.string().describe("Subject(s) position in frame. Single subject: 'Centered', 'Left third of frame', 'Right side'. Multiple subjects: 'Both centered', 'Left subject in left third, right subject in right third', 'Staggered - foreground subject left, background subject right'."),
    focus: z.string().describe("Depth: e.g., 'Deep focus', 'Subject(s) sharp, background slightly visible'."),
    photographicTricks: z.array(z.string()).describe("List of optical illusions or camera tricks used. Examples: 'Giant hand in extreme foreground creating forced perspective illusion', 'Mirror reflection trick', 'Tilt-shift miniature effect', 'Double exposure blend'. If no special tricks are used, return empty array."),
    backgroundOrientation: z.string().describe("Orientation of background elements (especially moving ones like trains, cars, crowds) relative to camera. E.g., 'Parallel/Horizontal - train moving left to right across frame', 'Three-quarter angle - train receding into distance', 'Perpendicular - train coming toward/away from camera'. Important for perspective lines."),
  }),

  // --- 6. TECHNICAL (RENDERING) ---
  technical: z.object({
    camera: z.string().describe("Simulated Gear: e.g., 'iPhone camera', 'compact camera, direct flash'."),
    postProcessing: z.string().describe("Grading: e.g., 'Flash photo look', 'Slightly overexposed highlight', 'Raw'."),
    focalLength: z.string().describe("Lens: e.g., '28mm wide angle'."),
  }),

  // ---- 7. CONTENT RATING (SAFETY) ----
  contentRating: z.enum([
    "SAFE", "SUGGESTIVE", "EXPLICIT", "NSFW"
  ]).describe("The content rating of the scene. Fallback to the most conservative rating if unsure."),
});

export const presetCreator = createTool({
  description: "Generate the preset schema from an image.",
  args: z.object({
    imageUrl: z.string(),
  }),
  handler: async (ctx, args) => {
    const result = await wrapAgent(defaultAgent).generateObject(ctx, {}, {
      providerOptions: models.vision.smart.providerOptions({ effort: 'max' }),
      model: models.vision.smart.model,
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
              1. COUNT SUBJECTS: How many clearly identifiable focal humans are in this scene? Usually 1. Only count as multiple subjects if there are 2+ people who are BOTH focal points (not crowds/blurred background people).
              2. DETACH the clothing from the scene description. The scene description must work even if the subject(s) were wearing neutral grey suits or naked.
              3. VISIBILITY CHECK: For each subject - Are they full body? Waist up? Headshot? If a body part or clothing item is cut off by the frame, return 'undefined'. Do NOT guess.
              4. OUTFIT PER SUBJECT: Each subject in the array gets their own complete outfit description.
              5. IDENTIFY strictly what is a 'Prop' (Environment/Subject) vs what is 'Fashion' (Outfit).
              6. CLASSIFY the lighting and camera angle using technical photography terms.
              
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
        if (obj.toLowerCase() === 'undefined') return undefined as T;
        if (obj === '[]') return [] as T;
        return obj;
      }
      if (Array.isArray(obj)) {
        // If array of empty objects [{}, {}], return []
        if (obj.every(item => typeof item === 'object' && Object.keys(item).length === 0))
          return [] as T;
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

    const sanitizeOutfit = (subject: typeof object.subjects[number]) => {
      const outfit = {
        ...subject.outfit,
        top: subject.outfit.top?.details && subject.outfit.top.type ? {
          type: subject.outfit.top.type,
          details: subject.outfit.top.details,
        } : undefined,
        legwear: subject.outfit.legwear?.details && subject.outfit.legwear.type ? {
          type: subject.outfit.legwear.type,
          details: subject.outfit.legwear.details,
        } : undefined,
        bottom: subject.outfit.bottom?.details && subject.outfit.bottom.type ? {
          type: subject.outfit.bottom.type,
          details: subject.outfit.bottom.details,
        } : undefined,
        outerwear: subject.outfit.outerwear?.details && subject.outfit.outerwear.type ? {
          type: subject.outfit.outerwear.type,
          details: subject.outfit.outerwear.details,
        } : undefined,
      }

      return {
        ...subject,
        outfit,
      }
    }

    return {
      ...object,
      subjects: object.subjects.map(sanitizeOutfit),
    }
  }
})