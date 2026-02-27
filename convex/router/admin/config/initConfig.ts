import { internalMutation } from "../../../procedures";

export const _internal = internalMutation({
  handler: async (ctx) => {
    const waitlist = await ctx.db.query("waitlist").collect();
    if (waitlist.length === 0) {
      await ctx.db.insert("waitlist", {
        numberOfCodes: 0,
        numberOfUsedCodes: 0,
        numberOfUsers: 0,
      })
    }

    const config = await ctx.db.query("config").collect();
    if (config.length === 0) {
      await ctx.db.insert("config", {
        appVersion: "1.0.0",
        minAppVersion: "1.0.0",
        maintenance: false,
      })
    }
  }
})