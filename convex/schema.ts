import { defineSchema } from "convex/server";
import { authTables } from "./schema/auth";
import { bookmarks, bookmarkStats } from "./schema/collection";
import { config } from "./schema/config";
import { feedScores } from "./schema/feed";
import { follows, followStats } from "./schema/follows";
import { generations, predictions } from "./schema/generations";
import { imageObjects, images, imageSizes } from "./schema/images";
import { items } from "./schema/items";
import { likes, likeStats } from "./schema/likes";
import { notifications, pushTokens } from "./schema/notifications";
import { outfitItems, outfits } from "./schema/outfits";
import { presetCategories, presetGenerations, presets } from "./schema/presets";
import { quests, userQuestProgress } from "./schema/quests";
import { subscriptions, subscriptionsHistory } from "./schema/subscriptions";
import { bots, userImages, usersAppearance, usersExtended } from "./schema/users";
import { waitlist, waitlistCodes } from "./schema/waitlist";
import { creditTransactions, userWallets } from "./schema/wallets";

export default defineSchema({
  ...authTables,
  config,
  usersExtended,
  bots,
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
  quests,
  userQuestProgress,
  feedScores,
  bookmarks,
  bookmarkStats,
  likes,
  likeStats,
  follows,
  followStats,
  userWallets,
  creditTransactions,
  waitlistCodes,
  waitlist,
  notifications,
  pushTokens,
});