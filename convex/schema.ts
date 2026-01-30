import { defineSchema } from "convex/server";
import { authTables } from "./schema/auth";
import { generations, predictions } from "./schema/generations";
import { imageObjects, images, imageSizes } from "./schema/images";
import { items } from "./schema/items";
import { outfitItems, outfits } from "./schema/outfits";
import { presetGenerations, presets } from "./schema/presets";
import { subscriptions, subscriptionsHistory } from "./schema/subscriptions";
import { userImages, userPortraits, usersExtended } from "./schema/users";

export default defineSchema({
  ...authTables,
  usersExtended,
  images,
  imageSizes,
  imageObjects,
  userImages,
  userPortraits,
  subscriptions,
  subscriptionsHistory,
  items,
  outfits,
  outfitItems,
  generations,
  predictions,
  presets,
  presetGenerations,
});