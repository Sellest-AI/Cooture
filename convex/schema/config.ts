import { defineTable } from "convex/server";
import { v } from "convex/values";

export const config = defineTable({
  upcomingAppVersion: v.optional(v.string()),
  appVersion: v.string(),
  minAppVersion: v.string(),
  maintenance: v.boolean(),
})
