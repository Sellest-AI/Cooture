import { createAccount } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api, internal } from "../../../_generated/api";
import { internalAction, MutationCtx } from "../../../_generated/server";
import { internalMutation } from "../../../procedures";

const getUser = (ctx: MutationCtx, email: string) => ctx.db.query("users").withIndex('email', (q) => q.eq('email', email)).first();

export const _internal = internalMutation({
  args: {
    generateTestAccount: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { generateTestAccount } = args;

    // Waitlist
    const waitlist = await ctx.db.query("waitlist").collect();
    if (waitlist.length === 0) {
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
      await ctx.db.insert("config", {
        appVersion: "0.9.2",
        minAppVersion: "0.9.1",
        maintenance: false,
      })
    }

    // Test Account
    const TEST_ACCOUNT = await ctx.runMutation(api.router.auth.getTestAccount.anon);
    const testAccount = await getUser(ctx, TEST_ACCOUNT.email);
    // Only create a test account if it doesn't exist, and if the flag is set to true
    const shouldCreateTestAccount = generateTestAccount ? !testAccount : false;

    await ctx.scheduler.runAfter(0, internal.router.admin.config.initConfig._internal_step_1,
      { createTestAccount: shouldCreateTestAccount })

    // Quests
    await ctx.runMutation(internal.router.quests.initAll._internal);
  }
})

export const _internal_step_1 = internalAction({
  args: {
    createTestAccount: v.boolean()
  },
  handler: async (ctx, args) => {
    const { createTestAccount } = args;

    if (createTestAccount) {
      const TEST_ACCOUNT = await ctx.runMutation(api.router.auth.getTestAccount.anon);
      await createAccount(ctx, {
        provider: "password",
        account: {
          id: TEST_ACCOUNT.email,
          secret: TEST_ACCOUNT.password,
        },
        profile: {
          email: TEST_ACCOUNT.email,
        },
        shouldLinkViaEmail: false,
        shouldLinkViaPhone: false,
      })
    }

    await ctx.scheduler.runAfter(10000, internal.router.admin.config.initConfig._internal_step_2)
  }
})

export const _internal_step_2 = internalMutation({
  handler: async (ctx) => {
    // Test Account
    const TEST_ACCOUNT = await ctx.runMutation(api.router.auth.getTestAccount.anon);
    const testAccount = await getUser(ctx, TEST_ACCOUNT.email);

    if (!testAccount) return;

    const user = await ctx.db.query("usersExtended")
      .withIndex('by_user_id', (q) => q.eq('userId', testAccount._id)).first();

    if (!user) return;

    await ctx.db.patch(user._id, { accountStatus: 'ACTIVE' });
  }
})