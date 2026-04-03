import { addBase64Header, compressImageAuto } from "@utils/convex-allowed/lib/images";
import { ConvexClient } from "convex/browser";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import z from "zod";
import { api } from "../convex/_generated/api";

dotenv.config({ path: ".env.local" });

const PresetSchema = z.object({
  sceneDescriptionShort: z.optional(z.string()),
  sceneDescription: z.string(),
  style: z.object({
    aesthetic: z.string(),
    lighting: z.string(),
    colorPalette: z.string(),
    texture: z.string(),
  }).strip(),
  environment: z.object({
    location: z.string(),
    backgroundDetails: z.string(),
    surroundingElements: z.array(z.string()),
  }).strip(),
  subjects: z.array(z.object({
    position: z.string(),
    bodyAlignment: z.string(),
    legs: z.array(z.string()),
    hands: z.array(z.string()),
    heldObjects: z.array(z.string()),
    head: z.object({
      direction: z.enum(["front", "side"]),
      angle: z.string(),
      expression: z.string(),
      gaze: z.string(),
    }).strip(),
    outfit: z.object({
      description: z.string(),
      top: z.optional(z.object({
        type: z.string(),
        details: z.string(),
      }).strip()),
      bottom: z.optional(z.object({
        type: z.string(),
        details: z.string(),
      }).strip()),
      legwear: z.optional(z.object({
        type: z.string(),
        details: z.string(),
      }).strip()),
      innerLayer: z.optional(z.string()),
      outerwear: z.optional(z.object({
        type: z.string(),
        details: z.string(),
      }).strip()),
      accessories: z.array(z.record(z.string(), z.string())),
      shoes: z.optional(z.string()),
    })
  }).strip()),
  composition: z.object({
    shotType: z.string(),
    cameraAngle: z.string(),
    cameraPosition: z.string(),
    subjectsPlacement: z.string(),
    photographicTricks: z.array(z.string()),
    backgroundOrientation: z.string(),
    focus: z.string(),
  }).strip(),
  technical: z.object({
    camera: z.string(),
    postProcessing: z.string(),
    focalLength: z.string(),
  }).strip(),
}).strip();

export const checkIfExists = async (convex: ConvexClient, name: string) => {
  const sanitizeName = (n: string) => n.trim().toUpperCase().replaceAll(' ', '_');
  const existingPresets = await convex.query(api.router.presets.getAll.anon, {});
  return existingPresets.some(p => sanitizeName(p.name) === sanitizeName(name));
}

export default async function main() {
  if (!process.env.EXPO_PUBLIC_CONVEX_URL)
    throw new Error("EXPO_PUBLIC_CONVEX_URL environment variable is not set");
  if (!process.env.CONVEX_SERVER_KEY)
    throw new Error("CONVEX_SERVER_KEY environment variable is not set");

  const convex = new ConvexClient(process.env.EXPO_PUBLIC_CONVEX_URL);

  // Load image from this folder
  const folderPath = path.join(__dirname);
  if (!fs.existsSync(folderPath)) throw new Error(`Folder not found: ${folderPath}`);

  const files = fs.readdirSync(folderPath);
  const jsonFiles = files.filter(file => file.endsWith(".json"));
  const imageFiles = files.filter(file => file.match(/\.(png|jpe?g|webp|gif)$/i));

  // Images
  const coverPath = imageFiles.find((f) => f.toLowerCase().includes("preview"));
  const depthMapPath = imageFiles.find((f) => f.toLowerCase().includes("depth"));

  if (!coverPath) throw new Error("No cover image found in the folder");
  if (!depthMapPath) throw new Error("No depth map image found in the folder");
  const cover = await compressImageAuto(fs.readFileSync(path.join(folderPath, coverPath)), { format: 'webp', maxSizeKb: 1 * 1024 });
  const depthMapBase64 = await compressImageAuto(fs.readFileSync(path.join(folderPath, depthMapPath)), { format: 'webp', maxSizeKb: 3 * 1024 });
  const coverBase64 = addBase64Header(cover.buffer.toString("base64"), "webp");
  const depthMapBase64Str = addBase64Header(depthMapBase64.buffer.toString("base64"), "webp");

  // Json
  const json = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFiles[0]), "utf-8"));

  const name = json.name ?? json.presetName;
  if (!name) throw new Error("Name is required in the JSON file");

  const alreadyExists = await checkIfExists(convex, name);
  if (alreadyExists) throw new Error(`Preset with name "${name}" already exists.`);

  const prompt = PresetSchema.parse(json);

  const presetId = await convex.action(api.router.presets.createOne.server, {
    _serverKey: process.env.CONVEX_SERVER_KEY,
    name: name,
    imageBase64: coverBase64,
    depthMapBase64: depthMapBase64Str,
    contentRating: json.contentRating ?? "SAFE",
    prompt: prompt,
  });

  if (presetId) console.log("💚 Preset created with ID:", presetId);
  if (!presetId) console.error("❌ Failed to create preset");

  process.exit();
}

main();