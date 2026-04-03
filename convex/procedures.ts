import { customAction, customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";
// import { wrapDatabaseReader } from "convex-helpers/server/rowLevelSecurity";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Auth } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { action, ActionCtx, DatabaseReader, mutation, query } from "./_generated/server";
import { env } from "./env";

export { internalMutation, internalQuery } from "./_generated/server";
export type { ActionCtx, MutationCtx, QueryCtx } from './_generated/server';
export const publicQuery = query;

// export { internal, api } from './_generated/api'; // CIRCULAR DEPENDENCY

type Context = Parameters<Parameters<typeof customCtx>[0]>[0] & {
  db?: DatabaseReader,
  runQuery?: ActionCtx['runQuery']
  auth: Auth;
};

type UserExtended = Omit<Doc<'usersExtended'>, '_id' | '_table'>
  & Doc<'users'> & { _idExtended: Id<'usersExtended'> };

type UserCheckResult = Promise<{
  user: UserExtended,
  userId: Id<'users'>
} | null>;

export const userCheck = async (ctx: Context): UserCheckResult => {
  // Look up the logged in user
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  // Action Ctx
  if (!ctx.db) {
    if (!ctx.runQuery) throw new Error("No database or runQuery available in context");
    const user = await ctx.runQuery(internal.router.users.getAccount._internal, { userId });
    if (!user) return null;
    return { user, userId };
  }

  const user = await ctx.db.get(userId);
  const userExtended = await ctx.db.query("usersExtended")
    .withIndex('by_user_id', (q) => q.eq("userId", userId)).first();

  if (!user || !userExtended) return null;
  // Pass in a user to use in evaluating rules,
  // which validate data access at access / write time.
  // const db = wrapDatabaseReader({ user, userExtended }, ctx.db, {});

  const finalUser = {
    ...userExtended,
    _idExtended: userExtended._id,
    ...user,
    name: userExtended.name || user.name,
    image: userExtended.imageUrl || user.image,
  }

  // This new ctx will be applied to the function's.
  // The user is a new field, the db replaces ctx.db
  return { user: finalUser, userId };
}

const userCheckOrThrow = async (ctx: Context) => {
  const user = await userCheck(ctx);
  if (!user) throw new Error("Unauthorized");
  return user;
}

// The base function we're extending
// Here we're using a `customCtx` helper because our modification
// only modifies the `ctx` argument to the function.
export const authQuery = customQuery(query, customCtx(userCheckOrThrow));
export const authMutation = customMutation(mutation, customCtx(userCheckOrThrow));
export const authAction = customAction(action, customCtx(userCheckOrThrow));

export const publicAction = action;

export const serverMutation = customMutation(mutation, {
  // This is the expanded customization simplified by `customCtx` above
  // You can specify arguments that the customization logic consumes
  args: { _serverKey: v.string() },
  // Similar to the `args` and `handler` for a normal function, the
  // args validated above define the shape of `args` below.
  input: async (ctx, { _serverKey }) => {
    // Add a simple check against a single API_KEY.
    if (_serverKey !== env.SERVER_PRIVATE_KEY) throw new Error("Invalid API key");
    // We return what parameters to ADD to the modified function parameters.
    // In this case, we aren't modifying ctx or args
    return { ctx, args: {} };
  },
});

export const serverQuery = customQuery(query, {
  args: { _serverKey: v.string() },
  input: async (ctx, { _serverKey }) => {
    if (_serverKey !== env.SERVER_PRIVATE_KEY) throw new Error("Invalid API key");
    return { ctx, args: {} };
  },
});

export const serverAction = customAction(action, {
  args: { _serverKey: v.string() },
  input: async (ctx, { _serverKey }) => {
    if (_serverKey !== env.SERVER_PRIVATE_KEY) throw new Error("Invalid API key");
    return { ctx, args: {} };
  },
})

export const adminAction = customAction(action, customCtx(async (ctx) => {
  const data = await userCheckOrThrow(ctx);
  if (data.user.role !== 'ADMIN') throw new Error("Unauthorized");
  return data;
}))

export const adminQuery = customQuery(query, customCtx(async (ctx) => {
  const data = await userCheckOrThrow(ctx);
  if (data.user.role !== 'ADMIN') throw new Error("Unauthorized");
  return { ctx, args: {} };
}))

export const adminMutation = customMutation(mutation, customCtx(async (ctx) => {
  const data = await userCheckOrThrow(ctx);
  if (data.user.role !== 'ADMIN') throw new Error("Unauthorized");
  return { ctx, args: {} };
}))

