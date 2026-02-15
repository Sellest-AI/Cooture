import { defineSchema } from "convex/server";
import { authTables } from "./schema/auth";
import { bookmarks, bookmarkStats } from "./schema/collection";
import { feedScores } from "./schema/feed";
import { generations, predictions } from "./schema/generations";
import { imageObjects, images, imageSizes } from "./schema/images";
import { items } from "./schema/items";
import { likes, likeStats } from "./schema/likes";
import { outfitItems, outfits } from "./schema/outfits";
import { presetCategories, presetGenerations, presets } from "./schema/presets";
import { subscriptions, subscriptionsHistory } from "./schema/subscriptions";
import { userImages, usersAppearance, usersExtended } from "./schema/users";

export default defineSchema({
  ...authTables,
  usersExtended,
  images,
  imageSizes,
  imageObjects,
  userImages,
  usersAppearance,
  subscriptions,
  subscriptionsHistory,
  items,
  outfits,
  outfitItems,
  generations,
  predictions,
  presets,
  presetCategories,
  presetGenerations,
  feedScores,
  bookmarks,
  bookmarkStats,
  likes,
  likeStats,
});