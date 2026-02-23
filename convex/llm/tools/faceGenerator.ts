import { faker } from "@faker-js/faker";
import { z } from "zod";
import { defaultAgent } from "../agents/default";
import { models } from "../config";
import { createTool } from "../utils";

const INSTRUCTIONS = `
You are a highly detailed facial feature generator. Given a person's basic attributes, generate an extremely detailed JSON representation of their face.

Be precise and realistic. All measurements should be in millimeters unless otherwise specified. Consider ethnic background, age, gender, and other attributes to generate realistic and consistent facial features.

Ensure all features are anatomically consistent and cohesive — for example, skin tone, eye color, and hair color should be plausible together given the person's background.

IMPORTANT: The weight and height provided MUST be reflected in the facial features. For example, a heavier person may have a rounder face, fuller cheeks, and a double chin, while a leaner person may have a more angular face with pronounced cheekbones. A taller person may have longer facial proportions, while a shorter person may have more compact features. Age should also be reflected in the features, with older individuals showing signs of aging such as wrinkles, sagging skin, and changes in facial structure.
IMPORTANT: The age provided should be reflected in the facial features. For example, an older person may have wrinkles, sagging skin, and age spots, while a younger person may have smoother skin and more youthful features. The age should also influence the overall facial structure, with older individuals potentially having more pronounced nasolabial folds, jowls, and changes in the eye area such as crow's feet.
IMPORTANT: The name provided indicates the person's cultural background, which should be reflected in the facial features. The name can provide important context for generating realistic and culturally consistent facial features.

VERY IMPORTANT: THE FACE MUST NOT ALWAYS BE PERFECT. REAL FACES HAVE ASYMMETRIES, IMPERFECTIONS, AND UNIQUE CHARACTERISTICS. INCORPORATE THESE ELEMENTS TO CREATE REALISTIC AND LIFELIKE FACES. FOR EXAMPLE, ONE EYE MAY BE SLIGHTLY LOWER THAN THE OTHER, OR THE NOSE MAY HAVE A SMALL BUMP. THESE DETAILS ADD REALISM AND UNIQUENESS TO THE GENERATED FACES.
`;

const EyeSchema = z.object({
  shape: z.string().describe("e.g. almond, round, monolid, hooded, deep-set, wide-set"),
  size: z.string().describe("e.g. small, medium, large"),
  color: z.string().describe("e.g. dark brown, hazel, green, blue-grey"),
  irisPattern: z.string().describe("e.g. starburst, radial, uniform"),
  pupilSize: z.string().describe("e.g. small, medium, large"),
  scleraColor: z.string().describe("e.g. white, slightly yellowish"),
  lidThickness: z.string().describe("e.g. thin, medium, thick"),
  doubleLid: z.boolean(),
  lashDensity: z.string().describe("e.g. sparse, medium, dense"),
  lashLength: z.string().describe("e.g. short, medium, long"),
  lashCurl: z.string().describe("e.g. straight, slight, curled"),
  eyebrowShape: z.string().describe("e.g. arched, straight, S-shaped"),
  eyebrowThickness: z.string().describe("e.g. thin, medium, thick, bushy"),
  eyebrowColor: z.string(),
  eyebrowLength: z.string().describe("e.g. short, medium, long, extended"),
  canthalTilt: z.string().describe("Angle of inner to outer corner: upturned, neutral, downturned"),
  interocularDistanceMm: z.number().describe("Distance between the two eyes in mm"),
  underEyeCircles: z.string().describe("e.g. none, mild, moderate, pronounced"),
  underEyePuffiness: z.string().describe("e.g. none, mild, moderate"),
});

const NoseSchema = z.object({
  overallShape: z.string().describe("e.g. straight, aquiline, snub, bulbous, button"),
  bridgeWidth: z.string().describe("e.g. narrow, medium, wide"),
  bridgeHeight: z.string().describe("e.g. low, medium, high"),
  bridgeProfile: z.string().describe("e.g. straight, concave, convex, with bump"),
  tipShape: z.string().describe("e.g. refined, bulbous, upturned, flat, pointed"),
  tipProjection: z.string().describe("e.g. low, medium, high"),
  nostrilShape: z.string().describe("e.g. oval, round, flared, narrow, wide"),
  nostrilFlare: z.string().describe("e.g. none, slight, moderate, prominent"),
  columnellaAngle: z.number().describe("Nasolabial angle in degrees"),
  lengthMm: z.number().describe("From nasion to tip"),
  widthMm: z.number().describe("At widest point"),
  symmetry: z.string().describe("e.g. symmetric, slightly deviated left/right"),
});

const MouthSchema = z.object({
  widthMm: z.number(),
  lipFullness: z.string().describe("e.g. thin, medium, full, very full"),
  upperLipShape: z.string().describe("e.g. flat, Cupid's bow pronounced, slight Cupid's bow"),
  lowerLipShape: z.string().describe("e.g. full, thin, pouty, flat"),
  upperToLowerLipRatio: z.string().describe("e.g. 1:1.2, 1:1.5"),
  lipColor: z.string().describe("Natural lip color, e.g. light pink, rosy pink, deep mauve, brownish-pink"),
  lipTexture: z.string().describe("e.g. smooth, slightly chapped, defined vermillion border"),
  philtrum: z.string().describe("e.g. well-defined, shallow, wide, narrow"),
  philtrumLengthMm: z.number(),
  cornerShape: z.string().describe("e.g. neutral, slightly upturned, slightly downturned"),
  teethVisible: z.boolean(),
});

const EarSchema = z.object({
  size: z.string().describe("e.g. small, medium, large"),
  shape: z.string().describe("e.g. round, oval, rectangular"),
  lobuleType: z.string().describe("e.g. attached, detached, transitional"),
  lobuleSize: z.string().describe("e.g. small, medium, large"),
  projection: z.string().describe("e.g. flat against head, slight, prominent"),
  helixShape: z.string().describe("e.g. well-rolled, thin, Darwin's tubercle present"),
  antitragusSize: z.string().describe("e.g. small, medium, prominent"),
});

const SkinSchema = z.object({
  tone: z.string().describe("Fitzpatrick scale + descriptive, e.g. Type II - fair with warm undertone"),
  undertone: z.string().describe("e.g. warm, cool, neutral, olive"),
  texture: z.string().describe("e.g. smooth, slightly textured, visible pores"),
  condition: z.string().describe("e.g. clear, mild acne, hyperpigmentation, rosacea"),
  wrinkles: z.string().describe("e.g. none, fine lines around eyes, nasolabial folds, forehead lines"),
  pores: z.string().describe("e.g. minimal, moderate, enlarged in T-zone"),
  frecklesOrMoles: z.string().describe("e.g. none, light freckling on nose, single mole left cheek"),
});

const HairSchema = z.object({
  color: z.string().describe("e.g. jet black, dark brown, chestnut, dirty blonde, auburn, silver"),
  texture: z.string().describe("e.g. straight, wavy, curly, coily"),
  thickness: z.string().describe("e.g. fine, medium, coarse"),
  density: z.string().describe("e.g. thin, medium, thick"),
  hairline: z.string().describe("e.g. straight, widow's peak, rounded, receding, high"),
  style: z.string().describe("e.g. short crop, shoulder-length, long, shaved sides, natural afro"),
  sheen: z.string().describe("e.g. matte, natural sheen, glossy"),
});

const FaceStructureSchema = z.object({
  overallShape: z.string().describe("e.g. oval, round, square, heart, diamond, oblong, triangle"),
  widthMm: z.number().describe("Bizygomatic width"),
  heightMm: z.number().describe("Total face height from hairline to chin"),
  cheekboneProminence: z.string().describe("e.g. flat, moderate, high and prominent"),
  cheekFullness: z.string().describe("e.g. hollow, gaunt, average, chubby, very full"),
  jawlineShape: z.string().describe("e.g. soft and rounded, defined, square, pointed, wide"),
  jawAngle: z.number().describe("Gonial angle in degrees"),
  chinShape: z.string().describe("e.g. round, pointed, square, cleft, recessed, protruding"),
  chinProjectionMm: z.number(),
  foreheadHeight: z.string().describe("e.g. low, medium, high"),
  foreheadWidth: z.string().describe("e.g. narrow, medium, broad"),
  temples: z.string().describe("e.g. flat, slight recession, hollow"),
  nasojugalFold: z.string().describe("Tear trough depth: none, mild, moderate, deep"),
  nasolabialFolds: z.string().describe("e.g. none, faint, moderate, deep"),
  mandibularAngle: z.string().describe("e.g. soft, moderate, prominent"),
  facialThirdProportions: z.object({
    upperThird: z.string().describe("Hairline to brow: short/average/tall"),
    middleThird: z.string().describe("Brow to nasal base: short/average/tall"),
    lowerThird: z.string().describe("Nasal base to chin: short/average/tall"),
  }),
});

const BotSchema = z.object({
  sex: z.string().describe("male or female"),
  ethnicGroup: z.string().describe("e.g. East Asian, South Asian, Middle Eastern, Sub-Saharan African, European, Latin American, mixed"),
  expressionAtRest: z.string().describe("Neutral resting expression, e.g. neutral, slightly smiling, serious, soft"),
  distinctiveFeatures: z.array(z.string()).describe("Any notable unique features, e.g. dimples, cleft chin, prominent brow ridge, high cheekbones"),
  overallAestheticImpression: z.string().describe("A brief holistic description of the face's overall look and feel"),
  faceStructure: FaceStructureSchema,
  skin: SkinSchema,
  eyes: z.object({
    left: EyeSchema,
    right: EyeSchema,
    symmetry: z.string().describe("e.g. highly symmetric, slight asymmetry left eye lower"),
  }),
  nose: NoseSchema,
  mouth: MouthSchema,
  ears: z.object({
    left: EarSchema,
    right: EarSchema,
  }),
  hair: HairSchema,
  facialHair: z.object({
    present: z.boolean(),
    type: z.string().optional().describe("e.g. clean shaven, stubble, full beard, goatee, mustache"),
    density: z.string().optional().describe("e.g. patchy, medium, full"),
    color: z.string().optional(),
    length: z.string().optional().describe("e.g. 1mm stubble, 5mm short beard, 3cm medium beard"),
  }),
});

export function faceJsonToMarkdown(face: z.infer<typeof BotSchema> & { weight?: string, age?: number }): string {
  const { faceStructure: f, skin, eyes, nose, mouth, ears, hair, facialHair, expressionAtRest, distinctiveFeatures, overallAestheticImpression, sex, ethnicGroup } = face;

  const eyeLine = (eye: z.infer<typeof EyeSchema>) =>
    `${eye.shape} ${eye.size} ${eye.color} | iris: ${eye.irisPattern} | lids: ${eye.lidThickness} doubleLid=${eye.doubleLid} | lashes: ${eye.lashDensity} ${eye.lashLength} ${eye.lashCurl} | brows: ${eye.eyebrowShape} ${eye.eyebrowThickness} ${eye.eyebrowColor} | canthus: ${eye.canthalTilt} | circles: ${eye.underEyeCircles} puff: ${eye.underEyePuffiness}`;

  return `
IMPORTANT APPEARANCE: ${sex}, ${ethnicGroup}, ${face.weight ? `${face.weight} weight` : 'average weight'}, ${face.age ? `age ${face.age}` : ''}
FACE: ${f.overallShape} ${f.widthMm}mm×${f.heightMm}mm | cheeks: ${f.cheekboneProminence} ${f.cheekFullness} | jaw: ${f.jawlineShape} ${f.jawAngle}° | chin: ${f.chinShape} +${f.chinProjectionMm}mm | forehead: ${f.foreheadHeight} ${f.foreheadWidth} | temples: ${f.temples}
THIRDS: upper=${f.facialThirdProportions.upperThird} mid=${f.facialThirdProportions.middleThird} lower=${f.facialThirdProportions.lowerThird}
FOLDS: nasolabial=${f.nasolabialFolds} tearTrough=${f.nasojugalFold} mandible=${f.mandibularAngle}
SKIN: ${skin.tone} ${skin.undertone} | texture: ${skin.texture} | condition: ${skin.condition} | wrinkles: ${skin.wrinkles} | pores: ${skin.pores} | marks: ${skin.frecklesOrMoles}
EYES: ${eyeLine(eyes.left)} | sym: ${eyes.symmetry} | interocular: ${eyes.left.interocularDistanceMm}mm
NOSE: ${nose.overallShape} | bridge: ${nose.bridgeWidth} ${nose.bridgeHeight} ${nose.bridgeProfile} | tip: ${nose.tipShape} ${nose.tipProjection} | nostrils: ${nose.nostrilShape} flare=${nose.nostrilFlare} | angle: ${nose.columnellaAngle}° | ${nose.lengthMm}mm×${nose.widthMm}mm | sym: ${nose.symmetry}
MOUTH: ${mouth.widthMm}mm | lips: ${mouth.lipFullness} upper=${mouth.upperLipShape} lower=${mouth.lowerLipShape} ratio=${mouth.upperToLowerLipRatio} | color: ${mouth.lipColor} | texture: ${mouth.lipTexture} | philtrum: ${mouth.philtrum} ${mouth.philtrumLengthMm}mm | corners: ${mouth.cornerShape}
EARS: ${ears.left.size} ${ears.left.shape} | lobe: ${ears.left.lobuleType} ${ears.left.lobuleSize} | proj: ${ears.left.projection} | helix: ${ears.left.helixShape}
HAIR: ${hair.color} ${hair.texture} ${hair.thickness} ${hair.density} | hairline: ${hair.hairline} | style: ${hair.style} | sheen: ${hair.sheen}
FACIAL_HAIR: ${facialHair.present ? `${facialHair.type} | density: ${facialHair.density} | color: ${facialHair.color} | length: ${facialHair.length}` : 'none'}
EXPRESSION: ${expressionAtRest}
DISTINCTIVE: ${distinctiveFeatures.join(', ')}
IMPRESSION: ${overallAestheticImpression}
`.trim();
}

export const faceGenerator = createTool({
  description: "Generate a face with specific characteristics.",
  args: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    gender: z.string().optional(),
    weight: z.string().optional(),
    skinTone: z.string().optional(),
    heightCm: z.number().optional(),
    age: z.number().optional(),
  }),
  handler: async (ctx, args) => {
    const hairColor = faker.helpers.arrayElement([
      "jet black", "dark brown", "chestnut", "dirty blonde", "auburn", "silver blonde", "blonde", "light brown", "dark red",
    ]);

    const faceShape = faker.helpers.arrayElement([
      "oval", "round", "square", "heart", "diamond", "oblong", "triangle",
    ]);

    const eyesColor = faker.helpers.arrayElement([
      "dark brown", "hazel", "green", "blue-grey", "amber", "light brown",
    ]);

    const beauty = faker.helpers.arrayElement([
      "strikingly beautiful", "handsome with rugged features", "androgynous beauty",
      "unique and unconventional attractiveness", "classic good looks",
      "exotic and captivating appearance",
    ]);

    const sanitizedArgs = {
      ...args,
      beauty,
      hairColor,
      faceShape,
      eyesColor,
    }

    const result = await defaultAgent.generateObject(ctx, { userId: ctx.userId }, {
      providerOptions: models.reasoning.smartest.providerOptions({ effort: 'none' }),
      model: models.reasoning.smartest.model,
      system: INSTRUCTIONS,
      prompt: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate the person's face with the following details: ${JSON.stringify(sanitizedArgs)}.`
            }
          ]
        }
      ],
      output: "object",
      maxRetries: 5,
      schema: BotSchema,
    }, { storageOptions: { saveMessages: 'none' } });

    return {
      object: result.object,
      markdown: faceJsonToMarkdown({ ...sanitizedArgs, ...result.object }),
    };
  }
});