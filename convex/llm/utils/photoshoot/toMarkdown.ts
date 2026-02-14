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

export const schemaToMarkdown = (schema: PromptExtended): string => {
  const prompt: string[] = [];

  schema.subjects.forEach((subject, index) => {
    prompt.push(sectionCreator(`SUBJECT ${index + 1}`, [
      { "Reference": subject.reference },
      { "Body Position": [subject.position, subject.bodyAlignment] },
      { "Appearance": [subject.height, subject.gender] },
      { "Head": [subject.head.angle, subject.head.expression, subject.head.gaze] },
      { "Hands": subject.hands },
      { "Held Objects": subject.heldObjects },
      { "Legs": subject.legs },
    ]))

    // Assuming all subjects share the same outfit for now
    if (index > 0) return;

    const outfit = subject.outfit;
    prompt.push(sectionCreator(`SHARED OUTFIT (VERY IMPORTANT)`, [
      { "Description": sliceText(outfit?.description, 75) },
      { "References": outfit.references },
      { "Outerwear": [outfit.outerwear?.type, sliceText(outfit.outerwear?.details, 75), outfit.outerwear?.fit, outfit.outerwear?.reference] },
      { "Top": [outfit.top?.type, sliceText(outfit.top?.details, 75), outfit.top?.fit, outfit.top?.reference] },
      { "Inner Layer": outfit.innerLayer },
      { "Bottom": [outfit.bottom?.type, sliceText(outfit.bottom?.details, 75), outfit.bottom?.fit, outfit.bottom?.reference] },
      { "Shoes": outfit.shoes },
      ...outfit.accessories.map((accessory, i) => ({ [`Accessory ${i + 1}`]: [Object.keys(accessory)[0], Object.values(accessory)[0]] }))
    ]))

    // When multiple outfits are supported
    //  prompt.push(sectionCreator(`SUBJECT ${index + 1} OUTFIT (VERY IMPORTANT)`, [
    //         { "Description": [outfit?.description] },
    //         { "References": outfit.references },
    //         { "Top": [outfit.outerwear?.type, outfit.top?.type, outfit.innerLayer] },
    //         { "Bottom": [outfit.bottom?.type] },
    //         { "Shoes": outfit.shoes },
    //         ...outfit.accessories.map((accessory, i) => ({ [`Accessory ${i + 1}`]: [Object.keys(accessory)[0], Object.values(accessory)[0]] }))
    //       ]))
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