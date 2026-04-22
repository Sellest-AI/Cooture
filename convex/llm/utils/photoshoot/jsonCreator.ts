import { notEmpty, sliceText } from "@shared/utils";
import { internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { ActionCtx } from "../../../procedures";
import { PRESET_PROMPT } from "../../../schema/presets";

type Prompt = typeof PRESET_PROMPT['type'];

type Schema = {
  prompt: Prompt;
  depthMap?: Id<'images'>,
  images: { url: string; hasAlpha: boolean }[];
}

type OutfitSize = 'TIGHT' | 'DEFAULT' | 'LOOSE' | 'EXTRA_LOOSE';

type Subject = {
  prompt: Prompt['subjects'][number];
  outfit?: { _id: Id<'outfits'>, size?: OutfitSize }
  userId?: Id<'users'>;
}

type SubjectExtended = Subject & { index: number }

const updateOutfit = async (ctx: ActionCtx, schema: Schema, subject?: SubjectExtended): Promise<Schema> => {
  if (!subject?.outfit) return schema;

  const outfit = await ctx.runQuery(internal.router.outfits.getOne._internal, { outfitId: subject.outfit._id });
  if (!outfit) return schema;

  // ---- EXTRACT ITEMS BY POSITION ----
  const top = outfit.items.find(i => i.position === 'TOP');
  const innerLayer = outfit.items.find(i => i.position === 'INNERLAYER');
  const bottom = outfit.items.find(i => i.position === 'BOTTOM');
  const legwear = outfit.items.find(i => i.position === 'LEGWEAR');
  const outerwear = outfit.items.find(i => i.position === 'OUTERWEAR');
  const accessories = outfit.items.filter(i => i.position === 'ACCESSORY');
  const shoes = outfit.items.find(i => i.position === 'SHOES');

  const hasItems = top || bottom || innerLayer || outerwear || accessories.length > 0 || shoes;
  if (!hasItems) return schema;

  // ---- IMAGES REFERENCES ----
  const baseImageIndex = schema.images.length + 1;
  const references = [
    top ? { ...top, url: top.image.sizes.medium.url, hasAlpha: top.image.hasAlpha } : undefined,
    bottom ? { ...bottom, url: bottom.image.sizes.medium.url, hasAlpha: bottom.image.hasAlpha } : undefined,
    legwear ? { ...legwear, url: legwear.image.sizes.medium.url, hasAlpha: legwear.image.hasAlpha } : undefined,
    outerwear ? { ...outerwear, url: outerwear.image.sizes.medium.url, hasAlpha: outerwear.image.hasAlpha } : undefined,
    innerLayer ? { ...innerLayer, url: innerLayer.image.sizes.medium.url, hasAlpha: innerLayer.image.hasAlpha } : undefined,
    ...(accessories.map((acc) => ({ ...acc, url: acc.image.sizes.medium.url, hasAlpha: acc.image.hasAlpha }))),
    shoes ? { ...shoes, url: shoes.image.sizes.medium.url, hasAlpha: shoes.image.hasAlpha } : undefined,
  ].filter(notEmpty)
    .filter((i) => {
      // If the prompt doesn't explicitly mention an item, we won't include it in the references, 
      // to avoid confusion for the LLM
      if (i.position === 'BOTTOM') if (!subject.prompt.outfit.bottom) return null;
      if (i.position === 'LEGWEAR') if (!subject.prompt.outfit.bottom) return null;
      if (i.position === 'SHOES') if (!subject.prompt.outfit.shoes) return null;
      return i;
    })
    .filter(notEmpty)
    .map((item, i) => ({
      type: item.position,
      name: item.name,
      url: item.url,
      hasAlpha: item.hasAlpha,
      text: `Image ${baseImageIndex + i} for ${item.position.toLowerCase()}.`
    }));

  const images = [...schema.images, ...references]

  // Build outfit description
  const description = references.length > 0 ? `An outfit featuring ${references.map((r) => r.name).join(', ')}` : subject.prompt.outfit.description;
  const _outfitSize = subject.outfit.size === 'DEFAULT' ? undefined : subject.outfit.size;
  const outfitSize = _outfitSize ? `IMPORTANT: ${_outfitSize.replaceAll('_', ' ')} FIT` : undefined;

  // Helper function to build details string
  const buildDetails = (item: typeof top) => {
    if (!item) return '';
    const parts = [
      sliceText(item.name, 20),
      ...item.materials.map(m => m.toLowerCase()).slice(0, 2),
    ];

    return parts.filter(notEmpty).join(', ');
  };

  const bottomObject = (() => {
    if (!subject.prompt.outfit.bottom) return undefined;
    if (bottom) return {
      type: bottom.name,
      details: buildDetails(bottom),
      reference: references.find((r) => r.type === 'BOTTOM')?.text,
    };
    if (top?.description?.includes('dress')) return undefined;
    return {
      type: 'Jeans',
      details: 'Classic straight denim jeans',
    }
  })()

  const legwearObject = (() => {
    if (!subject.prompt.outfit.bottom) return undefined;
    if (legwear) return {
      type: legwear.name,
      details: buildDetails(legwear),
      reference: references.find((r) => r.type === 'LEGWEAR')?.text,
    };
  })()

  const shoesObject = (() => {
    if (!subject.prompt.outfit.shoes) return undefined;
    if (shoes) return `${shoes.name} ${shoes.materials.map(m => m.toLowerCase()).slice(0, 2).join(' ')}`;
    return subject.prompt.outfit.shoes; // Undefined
  })()

  // ---- CUSTOM OUTFIT ----
  const customOutfit = {
    isCustom: true,
    description: [outfitSize, description].filter(notEmpty).join('. '),
    references: references.map((ref) => ref.text),
    top: top ? {
      type: top.name,
      details: buildDetails(top),
      reference: references.find((r) => r.type === 'TOP')?.text,
    } : {
      type: 'T-shirt',
      details: 'A cotton t-shirt',
    },
    bottom: bottomObject,
    legwear: legwearObject,
    innerLayer: innerLayer ? buildDetails(innerLayer) : undefined,
    outerwear: outerwear ? {
      type: outerwear.name,
      details: buildDetails(outerwear),
      reference: references.find((r) => r.type === 'OUTERWEAR')?.text,
    } : undefined,
    accessories: accessories.length > 0
      ? accessories.map(acc => ({
        [acc.name]: `${acc.materials.map(m => m.toLowerCase()).slice(0, 2).join(' ')}`
      }))
      : [],
    shoes: shoesObject,
  }

  const finalPrompt: Prompt = {
    ...schema.prompt,
    subjects: schema.prompt.subjects.map((s, i) =>
      i === subject.index ? { ...subject.prompt, outfit: { ...subject.prompt.outfit, ...customOutfit } } : s
    )
  }

  return { ...schema, images, prompt: finalPrompt }
}

const SUBJECT_CONFIG = {
  gender: 'female',
  ethnicity: 'european',
  tallHeight: 180,
  mediumHeight: 167,
} as const;

const updateSubjects = async (ctx: ActionCtx, schema: Schema, subjects: SubjectExtended[]): Promise<Schema> => {
  const pushFakeSubject = (subject: Prompt['subjects'][number]) => {
    const object = {
      ...subject,
      gender: subject.gender ?? SUBJECT_CONFIG.gender,
      reference: SUBJECT_CONFIG.ethnicity,
    }
    newSubjects.push(object);
  }

  let images = [...schema.images];

  // Fetch appearances strictly aligned with the subjects array
  const appearances = await Promise.all(subjects.map(s => s.userId ?
    ctx.runQuery(internal.router.users.getAppearance._internal, { userId: s.userId }) : null));

  let availablePresetSubjects = [...schema.prompt.subjects];
  let newSubjects: Prompt['subjects'] = [];

  // Iterate over the input users (subjects) to pair them with the best preset subject
  for (let i = 0; i < subjects.length; i++) {
    const appearance = appearances[i];

    // Find the best matching preset subject based on the user's actual gender
    let presetSubjectIndex = -1;
    if (appearance)
      presetSubjectIndex = availablePresetSubjects.findIndex(ps => ps.gender === appearance.gender);

    // Fallback to the next available preset subject if no perfect gender match
    if (presetSubjectIndex === -1) presetSubjectIndex = 0;

    const presetSubject = availablePresetSubjects.splice(presetSubjectIndex, 1)[0];
    if (!presetSubject) continue;

    // If no appearance data is available, preserve the preset subject
    if (!appearance) { pushFakeSubject(presetSubject); continue; }

    const heightAdjective = appearance.heightCm ? (appearance.heightCm > SUBJECT_CONFIG.tallHeight ? 'tall' :
      appearance.heightCm > SUBJECT_CONFIG.mediumHeight ? 'medium' : 'short') : undefined;

    const buildCleaned = appearance.size ? (appearance.size === 'heavy' ? 'heavyset' :
      appearance.size === 'heavyset' ? 'extremely heavyset' : appearance.size) : undefined;

    let image = presetSubject.head.direction === "side" ? appearance.sideImage : appearance.frontImage;
    if (!image) image = appearance.frontImage;
    if (image) images.push({ url: image.url, hasAlpha: image.hasAlpha });

    const prompt = {
      ...presetSubject,
      reference: image ? `Image ${images.length}. Use facial expression from prompt.` : undefined,
      gender: appearance.gender,
      height: appearance.heightCm ? `${appearance.heightCm}cm ${heightAdjective} height` : undefined,
      size: buildCleaned ? `${buildCleaned} build` : undefined,
    }

    newSubjects.push(prompt);
  }

  // Push any remaining preset subjects (e.g. preset has 3 people, but only 2 users provided)
  // Ensure they have a gender assigned so the type matches FinalPrompt
  for (const remaining of availablePresetSubjects) { pushFakeSubject(remaining); }

  // NOTE: We also need to update the `subjects` array since we re-ordered the prompt subjects,
  // we want `subjects[i].prompt` to match `newSubjects[i]` for the subsequent `updateOutfits` run.
  for (let i = 0; i < subjects.length; i++) {
    if (newSubjects[i]) subjects[i].prompt = newSubjects[i];
  }

  return {
    ...schema,
    images,
    prompt: {
      ...schema.prompt,
      subjects: newSubjects
    }
  }
}

const updateStyle = async (schema: Schema): Promise<Schema> => {
  const prompt = {
    ...schema.prompt,
    style: {
      ...schema.prompt.style,
      "grain": "Visible film grain texture, medium particle distribution, 35mm analog character, opacity 30-40%, nostalgic film aesthetic"
    },
    technical: {
      ...schema.prompt.technical,
      postProcessing: `${schema.prompt.technical.postProcessing}, subtle 35mm film grain overlay`.replaceAll(',,', ',')
    }
  }

  return {
    ...schema,
    prompt
  }
}

const orderSchema = async (schema: Schema): Promise<Schema> => {
  const { sceneDescription, style, environment, subjects, composition, technical } = schema.prompt;

  return {
    ...schema,
    prompt: {
      sceneDescription,
      composition,
      subjects,
      environment,
      style,
      technical,
    }
  }
}

const addDepthMap = async (ctx: ActionCtx, schema: Schema): Promise<Schema> => {
  if (schema.depthMap === undefined) return schema;

  const image = await ctx.runQuery(internal.router.storage.images.getOne._internal, { id: schema.depthMap })
  if (!image) return schema;

  const index = schema.images.length + 1;
  const images = [...schema.images, { url: image.sizes.small.url, hasAlpha: image.hasAlpha }];

  const prompt = {
    ...schema.prompt,
    composition: {
      ...schema.prompt.composition,
      depthMapReference: `Image ${index}. Don't copy subjects gender.`
    }
  }

  return {
    ...schema,
    images,
    prompt,
  }
}

const updateScene = (schema: Schema) => {
  const prompt = {
    ...schema.prompt,
    // Prefer the short description for the scene if it exists, to keep the prompt concise. 
    // The long description can be very verbose and include details that are not essential for the image generation.
    // Image Models often have a limit of characters (~2000) 
    sceneDescription:
      schema.prompt.sceneDescriptionShort ?? schema.prompt.sceneDescription,
  }

  return {
    ...schema,
    prompt
  }
}

const updateOutfits = async (ctx: ActionCtx, schema: Schema, subjects: Subject[]): Promise<Schema> => {
  for (const [index, _subject] of schema.prompt.subjects.entries()) {
    let subject: SubjectExtended = {
      index: index,
      prompt: _subject,
      outfit: subjects[index]?.outfit,
      userId: subjects[index]?.userId,
    }

    const outfitIndex = subject.outfit ? subjects.findIndex(s => s.outfit?._id === subject.outfit?._id) : -1;
    // Use an earlier processed subject's outfit to avoid duplicate API calls and image references
    const shareCustomOutfit = outfitIndex !== -1 && outfitIndex < index;

    if (!shareCustomOutfit) {
      schema = await updateOutfit(ctx, schema, subject);
      continue;
    }

    schema = {
      ...schema,
      prompt: {
        ...schema.prompt,
        subjects: schema.prompt.subjects.map((s, i, arr) => {
          if (i !== index) return s;
          return {
            ...s,
            outfit: arr[outfitIndex].outfit,
          }
        }),
      }
    }
  }

  return schema
}

type BaseSchema = {
  prompt: Prompt;
  depthMap?: Id<'images'>,
}


type Outfit = Prompt['subjects'][number]['outfit'];
export type PromptExtended = Omit<Prompt, 'subjects' | 'style' | 'composition' | 'technical'> & {
  style: Prompt['style'] & { grain: string };
  composition: Prompt['composition'] & { depthMapReference?: string };
  technical: Prompt['technical'];
  subjects: (Prompt['subjects'][number] & {
    reference?: string;
    gender: string;
    size?: string;
    height?: string;
    outfit?: Outfit & {
      isCustom?: boolean;
      references?: string[];
      top?: Outfit['top'] & { reference?: string };
      bottom?: Outfit['bottom'] & { reference?: string };
      legwear?: Outfit['bottom'] & { reference?: string };
      outerwear?: Outfit['outerwear'] & { reference?: string };
    };
  })[];
};

export const createPhotoshootSchema = async (ctx: ActionCtx, _schema: BaseSchema, subjects: Subject[]) => {
  let schema: Schema = { ..._schema, images: [] }

  schema = await updateSubjects(ctx, schema, subjects.map((s, i) => ({ ...s, index: i })));
  schema = await updateOutfits(ctx, schema, subjects);

  schema = await updateStyle(schema);
  schema = await addDepthMap(ctx, schema);
  schema = updateScene(schema);
  // Last step to ensure the schema is in the correct order for the LLM prompt
  schema = await orderSchema(schema);

  return schema as Omit<Schema, 'prompt'> & { prompt: PromptExtended };
}
