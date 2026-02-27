import { defineTable } from "convex/server";
import { v } from "convex/values";

export const config = defineTable({
  appVersion: v.string(),
  minAppVersion: v.string(),
  maintenance: v.boolean(),
})
