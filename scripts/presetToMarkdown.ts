type Prompt = {
  sceneDescriptionShort?: string,
  sceneDescription: string,
  style: {
    aesthetic: string,
    lighting: string,
    colorPalette: string,
    texture: string,
  },
  environment: {
    location: string,
    backgroundDetails: string,
    surroundingElements: string[],
  },
  subjects: {
    gender?: 'male' | 'female',
    position: string,
    bodyAlignment: string,
    legs: string[],
    hands: string[],
    heldObjects: string[],
    head: {
      direction: 'front' | 'side',
      angle: string,
      expression: string,
      gaze: string,
    },
    outfit: {
      description: string,
      top?: {
        type: string,
        details: string,
      },
      bottom?: {
        type: string,
        details: string,
      },
      legwear?: {
        type: string,
        details: string,
      },
      innerLayer?: string,
      outerwear?: {
        type: string,
        details: string,
      },
      accessories?: Record<string, string>[],
      shoes?: string,
    }
  }[],
  composition: {
    shotType: string,
    cameraAngle: string,
    cameraPosition: string,
    subjectsPlacement: string,
    photographicTricks: string[],
    backgroundOrientation: string,
    focus: string,
  },
  technical: {
    camera: string,
    postProcessing: string,
    focalLength: string,
  },
}

type Schema = {
  prompt: Prompt;
  depthMap?: string,
  images: { url: string; hasAlpha: boolean }[];
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

const updateSubjects = async (schema: Schema, subjects: Subject[]): Promise<Schema> => {
  const prompt = {
    ...schema.prompt,
    subjects: schema.prompt.subjects.map((s, i) => ({
      ...s,
      ...subjects[i]
    }))
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

const addDepthMap = async (schema: Schema): Promise<Schema> => {
  if (schema.depthMap === undefined) return schema;

  const index = schema.images.length + 1;

  const prompt = {
    ...schema.prompt,
    composition: {
      ...schema.prompt.composition,
      depthMapReference: `Image ${index}. Don't copy subjects gender.`
    }
  }

  return {
    ...schema,
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

const updateOutfit = async (schema: Schema, outfit: Outfit, shareOutfit: boolean): Promise<Schema> => {
  const prompt = {
    ...schema.prompt,
    subjects: schema.prompt.subjects.map((s, i) => ({
      ...s,
      outfit: (shareOutfit ? outfit : i === 0 ? outfit : s.outfit),
    }))
  }

  return {
    ...schema,
    prompt
  }
}

type Clothes = {
  type: string,
  details: string,
}

type Outfit = {
  description: string;
  isCustom?: boolean;
  references?: string[];
  top?: Clothes & { reference?: string };
  bottom?: Clothes & { reference?: string };
  legwear?: Clothes & { reference?: string };
  outerwear?: Clothes & { reference?: string };
  shoes?: string;
  accessories: Record<string, string>[];
}

type PromptExtended = Omit<Prompt, 'subjects' | 'style' | 'composition' | 'technical'> & {
  style: Prompt['style'] & { grain: string };
  composition: Prompt['composition'] & { depthMapReference?: string };
  technical: Prompt['technical'];
  subjects: (Prompt['subjects'][number] & {
    reference?: string;
    gender: string;
    size?: string;
    height?: string;
    outfit: Outfit;
  })[];
};

type Subject = {
  height: string;
  gender: "male" | "female";
  size: "lean" | "average" | "athletic" | "muscular" | "heavy" | "heavyset";
  reference: string;
}

type Data = {
  shareOutfit: boolean;
  subjects: Subject[];
  outfit: Outfit;
}

const createPhotoshootSchema = async (_schema: Prompt, data: Data) => {
  let schema: Schema = { prompt: _schema, images: [] }

  schema = await updateSubjects(schema, data.subjects);
  schema = await updateOutfit(schema, data.outfit, data.shareOutfit);

  schema = await updateStyle(schema);
  schema = await addDepthMap(schema);
  schema = updateScene(schema);
  // Last step to ensure the schema is in the correct order for the LLM prompt
  schema = await orderSchema(schema);

  return schema as Omit<Schema, 'prompt'> & { prompt: PromptExtended };
}


const sectionCreator = (title: string, content: Record<string, undefined | string | (string | undefined)[]>[]): string => {
  const sectionHeader = `# ${title}\n`;
  const sectionContent = content.map(item => {
    const key = Object.keys(item)[0];
    const value = item[key];
    if (value === undefined) return undefined;
    if (Array.isArray(value)) {
      if (value.length === 0) return undefined;
      if (value.every(v => v === undefined)) return undefined;
      return `- ${key}: ${value.filter(v => v !== undefined).join(", ")}`;
    } else {
      if (value.length === 0) return undefined;
      return `- ${key}: ${value}`;
    }
  }).filter(Boolean).join("\n")
    .replaceAll(",.", ".")
    .replaceAll(".,", ",")
    .replaceAll(",,", ",")

  return sectionHeader + sectionContent;
}

/**
 * Utility function to convert the photoshoot schema into a Markdown format that can be used as a prompt for the image generation model.
 * @param schema 
 * @returns Truncated and sanitized JSON in Markdown format
 */
const schemaToMarkdown = (schema: PromptExtended): string => {
  const prompt: string[] = [];

  const hasCustomOutfit = schema.subjects.some(s => s.outfit?.isCustom);

  schema.subjects.forEach((subject, index) => {
    prompt.push(sectionCreator(`SUBJECT ${index + 1}`, [
      { "Reference": subject.reference },
      { "Body Position": [subject.position, subject.bodyAlignment] },
      { "Appearance": [subject.height, subject.size, subject.gender] },
      { "Head": [subject.head.angle, subject.head.expression, subject.head.gaze] },
      { "Hands": subject.hands },
      { "Held Objects": subject.heldObjects },
      { "Legs": subject.legs },
    ]))

    const outfit = subject.outfit;
    if (!outfit) return;

    const isCustomOutfit = outfit.isCustom === true;

    const references = isCustomOutfit ?
      outfit.references : (hasCustomOutfit ? "Don't use reference image." : undefined);

    // If only one subject is present, we can afford to include more detailed information about the outfit, 
    // as there is no risk of confusing the model with multiple outfits.
    if (schema.subjects.length === 1) {
      prompt.push(sectionCreator(`SUBJECT ${index + 1} OUTFIT (VERY IMPORTANT)`, [
        { "Description": outfit.description },
        { "References": references },
        { "Outerwear": [isCustomOutfit ? outfit.outerwear?.type : outfit.outerwear?.details] },
        { "Top": [isCustomOutfit ? outfit.top?.type : outfit.top?.details] },
        { "Inner Layer": outfit.innerLayer },
        { "Bottom": [isCustomOutfit ? outfit.bottom?.type : outfit.bottom?.details] },
        { "Legwear": [isCustomOutfit ? outfit.legwear?.type : outfit.legwear?.details] },
        { "Shoes": outfit.shoes },
        ...outfit.accessories.map((accessory, i) => ({ [`Accessory ${i + 1}`]: [Object.keys(accessory)[0], Object.values(accessory)[0]] }))
      ]))
    }
    // For simplicity, when multiple subjects are present, we only include a general description of the outfit without breaking it down into layers and items, 
    // to avoid overwhelming the model with details that may be hard to associate with the correct subject.
    else {
      prompt.push(sectionCreator(`SUBJECT ${index + 1} OUTFIT (VERY IMPORTANT)`, [
        { "Description": outfit.description },
        { "References": references },
        { "Outerwear": isCustomOutfit ? [] : [outfit.outerwear?.details] },
        // Only include the top description if the outfit has no outerwear (reducing tokens)
        { "Top": (outfit.outerwear || isCustomOutfit) ? [] : [outfit.top?.details] },
        ...outfit.accessories.map((accessory, i) => ({ [`Accessory ${i + 1}`]: [Object.keys(accessory)[0], Object.values(accessory)[0]] }))
      ]))
    }
  })

  prompt.push(sectionCreator("COMPOSITION", [
    { "Scene": schema.sceneDescriptionShort ?? schema.sceneDescription },
    { "Subjects Arrangement": schema.composition.subjectsPlacement },
    { "Camera": [schema.composition.cameraPosition, schema.composition.focus, schema.composition.cameraAngle, schema.technical.camera, schema.technical.focalLength].join(", ") },
    { "Framing": schema.composition.shotType },
    { "Photographic Tricks": schema.composition.photographicTricks },
    { "Background Orientation": schema.composition.backgroundOrientation },
    { "Depth Map": schema.composition.depthMapReference },
  ]));

  prompt.push(sectionCreator("ENVIRONMENT", [
    { "Location": schema.environment.location },
    { "Background": schema.environment.backgroundDetails },
    { "Surrounding Elements": schema.environment.surroundingElements },
  ]));

  prompt.push(sectionCreator("STYLE & LIGHTING", [
    { "Aesthetic": schema.style.aesthetic },
    { "Color Palette": schema.style.colorPalette },
    { "Texture": schema.style.texture },
    { "Lighting": schema.style.lighting },
    { "Effects": [schema.style.grain, schema.technical.postProcessing] },
  ]));

  return prompt.join("\n");
}

// ------------------------------------------------------

const subjects: Subject[] = [
  {
    gender: "male",
    height: "180cm tall",
    size: "average",
    reference: 'Image 1'
  },
  {
    gender: "female",
    height: "165cm tall",
    size: "lean",
    reference: 'Image 2'
  }
]

const outfit: Outfit = {
  isCustom: true,
  description: "IMPORTANT: LOOSE FIT. An outfit featuring Washed Wide-Leg Seam Jeans, Lakers Moto Unisex Track Jacket, Adidas Tokyo Low-Top Sneakers, Nightcrawler Tortoise Sunglasses",
  accessories: [
    { "Nightcrawler Tortoise Sunglasses": "plastic glass" }
  ],
  bottom: {
    "type": "Washed Wide-Leg Seam Jeans",
    "details": "Washed Wide-Leg S..., denim, cotton",
    "reference": "Image 3 for bottom."
  },
  shoes: "Adidas Tokyo Low-Top Sneakers synthetic leather",
  top: { "type": "T-shirt", "details": "A cotton t-shirt" },
  outerwear: {
    "type": "Lakers Moto Unisex Track Jacket",
    "details": "Lakers Moto Unise..., cotton, synthetic",
    "reference": "Image 4 for outerwear."
  },
  references: [
    "Image 3 for bottom.",
    "Image 4 for outerwear.",
    "Image 5 for accessory.",
    "Image 6 for shoes."
  ]
}

const schema: Prompt = {
  composition: {
    backgroundOrientation: "Parallel to the camera plane",
    cameraAngle: "Eye level",
    cameraPosition: "Frontal",
    focus:
      "Subject sharp, background details clearly visible and in focus",
    photographicTricks: [],
    shotType: "Medium Full Shot",
    subjectsPlacement:
      "Both subjects centered side-by-side in the frame",
  },
  environment: {
    backgroundDetails:
      "A classical building facade featuring large arched windows with dark frames and structured stone block walls.",
    location:
      "Urban plaza or sidewalk outside a grand building",
    surroundingElements: [
      "Dense, neatly trimmed green hedge",
      "Limestone planter ledge",
      "Thin tree trunk on the left",
      "Soft reflections of trees in the window glass",
    ],
  },
  sceneDescription:
    "Two individuals are seated side-by-side on a flat, light-colored stone ledge in a bright outdoor urban environment during the day. Both individuals have their arms tightly crossed over their torsos. The subject on the left is leaning their head and upper body toward the subject on the right, who sits with a more upright and vertical posture. In a coordinated gesture, the inner foot of the left subject and the inner foot of the right subject are raised and pressed together at the center of the frame. Behind them is a manicured, hip-high green hedge that runs horizontally across the scene. Further in the background is a limestone or light stone building with large, arched windows that reflect the sky and surrounding trees. A slender, dark-barked tree trunk is visible on the far left. The lighting is direct, harsh midday sunlight, creating high-contrast highlights on the subjects and casting sharp, dark shadows on the stone ledge and ground.",
  sceneDescriptionShort:
    "Two subjects sit on a stone ledge with arms crossed and their inner feet touching in a playful pose against a background of greenery and classic stone architecture.",
  style: {
    aesthetic:
      "Streetwear lifestyle photography, candid city snapshot",
    colorPalette:
      "Natural tones of beige stone, vibrant hedge green, and bright daylight highlights",
    lighting:
      "Hard, direct midday sunlight with high contrast and sharp shadows",
    texture:
      "The rough texture of the stone ledge, the waxy foliage of the hedge, and the matte finish of the masonry building",
  },
  subjects: [
    {
      bodyAlignment: "Frontal, leaning to the right",
      gender: "female",
      hands: [
        "Arms crossed over the midsection",
        "Left arm folded over the right",
      ],
      head: {
        angle: "Tilted toward the right shoulder",
        direction: "front",
        expression: "A subtle, knowing smile",
        gaze: "Looking slightly down and toward the right",
      },
      heldObjects: [],
      legs: [
        "Right leg bent with the foot raised to touch the other person's shoe",
        "Left leg hanging down toward the ground",
      ],
      outfit: {
        accessories: [{}],
        bottom: {
          details:
            "Faded black or charcoal grey loose-fitting cotton pants.",
          type: "Trousers",
        },
        description:
          "Casual streetwear look with an oversized graphic tee and relaxed trousers.",
        legwear: {
          details: "White athletic crew socks.",
          type: "Socks",
        },
        shoes:
          "Olive green quilted slip-on sneakers with a dark sole.",
        top: {
          details:
            "White cotton short-sleeved tee featuring a large gothic-style black logo graphic and text on the chest.",
          type: "T-shirt",
        },
      },
      position: "Sitting",
    },
    {
      bodyAlignment: "Frontal",
      gender: "male",
      hands: [
        "Arms crossed over the chest",
        "Hands tucked under the opposite armpits",
      ],
      head: {
        angle: "Turned slightly to the right",
        direction: "side",
        expression: "Neutral and contemplative",
        gaze: "Looking off into the distance to the right",
      },
      heldObjects: [],
      legs: [
        "Left leg bent with the foot raised to meet the other person's shoe",
        "Right leg folded or tucked beneath the left",
      ],
      outfit: {
        accessories: [{}, {}],
        bottom: {
          details:
            "Extra-wide, oversized white technical fabric pants with cinched detailing at the cuffs and pleated volume.",
          type: "Cargo pants",
        },
        description:
          "Layered grunge-inspired streetwear with voluminous bottoms and plaid patterns.",
        outerwear: {
          details:
            "Button-down flannel shirt in a blue, tan, and white check pattern, worn completely open.",
          type: "Flannel shirt",
        },
        shoes:
          "Two-tone cream and light grey puffy high-top sneakers.",
        top: {
          details:
            "Black crewneck t-shirt with a blue graphic print visible in the center.",
          type: "T-shirt",
        },
      },
      position: "Sitting",
    },
  ],
  technical: {
    camera: "Smartphone camera",
    focalLength: "28mm wide angle",
    postProcessing:
      "Vibrant and natural with high-key exposure",
  },
}

// ------------------------------------------------------

createPhotoshootSchema(schema, { subjects, outfit, shareOutfit: false })
  .then((result) => {
    const markdown = schemaToMarkdown(result.prompt);
    console.log(markdown);
    console.log("Length:", markdown.length);
  });