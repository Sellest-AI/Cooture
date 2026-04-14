import { sliceText } from "@shared/utils";
import { PromptExtended } from "./jsonCreator";

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
export const schemaToMarkdown = (schema: PromptExtended): string => {
  const prompt: string[] = [];

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
    const isCustomOutfit = outfit.isCustom === true;
    // If only one subject is present, we can afford to include more detailed information about the outfit, 
    // as there is no risk of confusing the model with multiple outfits.
    if (schema.subjects.length === 1) {
      prompt.push(sectionCreator(`SUBJECT ${index + 1} OUTFIT (VERY IMPORTANT)`, [
        { "Description": outfit?.description },
        { "References": outfit.references },
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
        { "Description": sliceText(outfit?.description, 175) },
        { "References": outfit.references },
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