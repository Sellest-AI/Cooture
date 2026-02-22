import { createCustomer } from "@/lib/stripe";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction, internalMutation } from "../../_generated/server";
import { createUserWallet } from "../../functions/credits";
import { updateWaitlist } from "../../functions/waitlist";

export const _private = internalMutation({
  args: { userId: v.id("users"), stripeCustomerId: v.string() },
  handler: async (ctx, args): Promise<boolean> => {
    const { userId, stripeCustomerId } = args;

    const user = await ctx.db.get(userId);

    await Promise.all([
      // ctx.runMutation(internal.router.subscription.createFreeSubscription._internal, { userId }),

      // createReferralCode(ctx.db, { userId }),

      ctx.db.insert("usersExtended", {
        userId,
        canTakeFreeTrial: true,
        stripeCustomerId: stripeCustomerId,
        accountStatus: "WAITLIST",
        name: user?.name,
        imageUrl: user?.image,
        role: "USER"
      }),

      // Create user wallet with starting credits
      createUserWallet(ctx, userId),

      // increment waitlist users count
      updateWaitlist(ctx, { addUsers: 1 })
    ])

    return true;
  }
})

const args = {
  userId: v.id("users"),
  email: v.optional(v.string()),
  name: v.optional(v.string()),
}

export const action = internalAction({
  args, handler: async (ctx, args): Promise<boolean> => {
    if (!args.email) // don't allow to create user without email
      throw new Error(`can't create user, ${args.name} - ${args.userId} has no email`);

    const stripeCustomer = await createCustomer({
      id: args.userId,
      email: args.email,
      name: args.name,
    })

    const stripeCustomerId = stripeCustomer.id;

    await ctx.runMutation(internal.router.auth.postCreateOrUpdate._private,
      { userId: args.userId, stripeCustomerId })

    await ctx.runAction(internal.router.auth.linkStripeSubscription._private, {
      userId: args.userId,
      stripeCustomerId: stripeCustomerId,
    })

    return true;
  }
})