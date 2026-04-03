import { v } from "convex/values";
import { internal } from "../../../_generated/api";
import { internalMutation } from "../../../procedures";

export const _internal = internalMutation({
  args: {
    generateTestAccount: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { generateTestAccount } = args;

    // Waitlist
    const waitlist = await ctx.db.query("waitlist").collect();
    if (waitlist.length === 0) {
      console.log("Initializing waitlist with default values");
      await ctx.db.insert("waitlist", {
        numberOfCodes: 0,
        numberOfUsedCodes: 0,
        numberOfUsersIn: 0,
        numberOfUsersOut: 0,
      })
    }

    // Config
    const config = await ctx.db.query("config").collect();
    if (config.length === 0) {
      console.log("Initializing config with default values");
      await ctx.db.insert("config", {
        appVersion: "0.9.0",
        minAppVersion: "0.9.0",
        maintenance: false,
      })
    }

    if (generateTestAccount) {
      console.log("Scheduling test account creation");
      await ctx.runMutation(internal.router.admin.bots.createTestAccount._internal);
    }

    // Quests
    console.log("Initializing quests");
    await ctx.runMutation(internal.router.quests.initAll._internal);
  }
})