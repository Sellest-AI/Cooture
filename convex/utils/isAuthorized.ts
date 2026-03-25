import { v } from "convex/values";
import { isAuthorized } from "../functions/users";
import { internalQuery } from "../procedures";

export const _internal = internalQuery({
  args: {
    userId: v.id("users"),
    id: v.union(
      v.id("generations"),
      v.id("outfits"),
      v.id("items"),
      v.id("predictions"),
      v.id("presets")
    ),
    throwOnReject: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, id, throwOnReject }) => {
    return isAuthorized({ ...ctx, userId: userId }, id, { throwOnReject: throwOnReject });
  }
})