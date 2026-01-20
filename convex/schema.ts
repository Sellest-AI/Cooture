import { defineSchema } from "convex/server";
import { authTables } from "./schema/auth";
import { userImages, usersExtended } from "./schema/users";
import { imageObjects, images, imageSizes } from "./schema/images";
import { subscriptions, subscriptionsHistory } from "./schema/subscriptions";

export default defineSchema({
  ...authTables,
  usersExtended,
  images,
  imageSizes,
  imageObjects,
  userImages,
  subscriptions,
  subscriptionsHistory,
  // messages: defineTable({
  //   body: v.string(),
  //   user: v.id("users"),
  // }),
});