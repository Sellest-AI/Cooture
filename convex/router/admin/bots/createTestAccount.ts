import { createAccount } from "@convex-dev/auth/server";
import { api, internal } from "../../../_generated/api";
import { internalAction, MutationCtx } from "../../../_generated/server";
import { internalMutation } from "../../../procedures";

const getUser = (ctx: MutationCtx, email: string) => ctx.db.query("users").withIndex('email', (q) => q.eq('email', email)).first();

/**
 * Can be called to create a test account or restore it if it has been deleted.
 * The creation is split in two steps to avoid duplicate accounts.
 */
export const _internal = internalMutation({
  handler: async (ctx) => {
    // Test Account
    const TEST_ACCOUNT = await ctx.runMutation(api.router.auth.getTestAccount.anon);
    const testAccount = await getUser(ctx, TEST_ACCOUNT.email);

    if (!testAccount)
      await ctx.scheduler.runAfter(0, internal.router.admin.bots.createTestAccount._internal_step_1)

    // Can have a race condition if the account is created between the two calls,
    // But it's fine since the second call is idempotent
    await ctx.scheduler.runAfter(10000, internal.router.admin.bots.createTestAccount._internal_step_2)
  }
})

export const _internal_step_1 = internalAction({
  handler: async (ctx) => {
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
})

export const _internal_step_2 = internalMutation({
  handler: async (ctx) => {
    const TEST_ACCOUNT = await ctx.runMutation(api.router.auth.getTestAccount.anon);
    const testAccount = await getUser(ctx, TEST_ACCOUNT.email);

    if (!testAccount) return;

    const user = await ctx.db.query("usersExtended")
      .withIndex('by_user_id', (q) => q.eq('userId', testAccount._id)).first();

    if (!user) return;

    await ctx.db.patch(user._id, {
      accountStatus: 'ACTIVE',
      firstName: "Zephyr",
      lastName: "Callindra",
      name: "Zephyr Dra",
      username: "z3phyr_c4llindra96",
    })
  }
})