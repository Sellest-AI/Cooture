import { customAction, customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";
// import { wrapDatabaseReader } from "convex-helpers/server/rowLevelSecurity";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Auth } from "convex/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { action, ActionCtx, DatabaseReader, mutation, query } from "./_generated/server";
import { env } from "./env";
import { isAuthorized } from "./functions/users/isAuthorized";
import { constantTimeEqual } from "./lib/crypto";

export { httpAction, internalAction, internalMutation, internalQuery } from "./_generated/server";
export type { ActionCtx, MutationCtx, QueryCtx } from './_generated/server';
export const publicQuery = query;
export const publicMutation = mutation;

// export { internal, api } from './_generated/api'; // CIRCULAR DEPENDENCY

type Context = Parameters<Parameters<typeof customCtx>[0]>[0] & {
  db?: DatabaseReader,
  runQuery?: ActionCtx['runQuery']
  auth: Auth;
};

type UserExtended = Omit<Doc<'usersExtended'>, '_id' | '_table' | 'imageUrl'>
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

  const { imageUrl, ...userExtendedWithoutImage } = userExtended;
  const image = imageUrl ?? user.image;

  const finalUser = {
    ...userExtendedWithoutImage,
    ...user,
    _idExtended: userExtended._id,
    name: userExtended.name || user.name,
    image,
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

/**
 * Compares the caller-supplied key against SERVER_PRIVATE_KEY.
 *
 * Two properties matter here (03-FLAWS F3):
 *  - reading `env.SERVER_PRIVATE_KEY` throws when the variable is unset, so a deployment
 *    that forgot it rejects every `server*` call instead of accepting `_serverKey: ""`;
 *  - the comparison is constant-time, so the key cannot be recovered by timing.
 */
const serverKeyCheck = (_serverKey: string) => {
  if (!constantTimeEqual(_serverKey, env.SERVER_PRIVATE_KEY))
    throw new ConvexError("Invalid API key");
};

const serverKeyArgs = { _serverKey: v.string() };

export const serverMutation = customMutation(mutation, {
  // This is the expanded customization simplified by `customCtx` above
  // You can specify arguments that the customization logic consumes
  args: serverKeyArgs,
  // Similar to the `args` and `handler` for a normal function, the
  // args validated above define the shape of `args` below.
  input: async (ctx, { _serverKey }) => {
    serverKeyCheck(_serverKey);
    // We return what parameters to ADD to the modified function parameters.
    // In this case, we aren't modifying ctx or args
    return { ctx, args: {} };
  },
});

export const serverQuery = customQuery(query, {
  args: serverKeyArgs,
  input: async (ctx, { _serverKey }) => {
    serverKeyCheck(_serverKey);
    return { ctx, args: {} };
  },
});

export const serverAction = customAction(action, {
  args: serverKeyArgs,
  input: async (ctx, { _serverKey }) => {
    serverKeyCheck(_serverKey);
    return { ctx, args: {} };
  },
})

/**
 * One customization shared by all three admin builders so they cannot drift apart.
 *
 * `customCtx` already wraps the return value in `{ ctx }` — returning `{ ctx, args: {} }`
 * here (as adminQuery/adminMutation used to) double-wraps it, which dropped `ctx.user`
 * and `ctx.userId` from every admin query and mutation handler (03-FLAWS F5).
 */
const requireAdmin = customCtx(async (ctx: Context) => {
  const data = await userCheckOrThrow(ctx);
  if (data.user.role !== 'ADMIN') throw new ConvexError("Unauthorized");
  return data;
});

export const adminAction = customAction(action, requireAdmin);
export const adminQuery = customQuery(query, requireAdmin);
export const adminMutation = customMutation(mutation, requireAdmin);

/* ─── Ownership as a capability, not a convention (03-FLAWS F1 / F6) ─────────── */

/** Tables `isAuthorized` knows how to resolve an owner for. */
type OwnedTable = 'generations' | 'outfits' | 'items' | 'predictions' | 'presets';

/**
 * `isAuthorized` is generic over one concrete id type at a time, which does not survive
 * being called with `Id<T>` for an unresolved `T`. One cast here, so the call sites need none.
 */
const checkOwnership = isAuthorized as unknown as
  (ctx: unknown, id: string) => Promise<Record<string, unknown> | boolean>;

/**
 * Loads `args.id`, asserts the caller owns it, and exposes it to the handler as `ctx.doc`.
 * There is no code path that reaches the handler with a document the caller does not own,
 * which is the difference between a capability and the optional helper call it replaces.
 *
 * The ownership *rules* stay in `functions/users/isAuthorized` (it also resolves indirect
 * ownership, e.g. a prediction owned through its parent generation); this only guarantees
 * they are always *applied*.
 *
 * ⚠️ Because the customization declares `args`, every consumer must declare its own `args`
 * too — `args: {}` when it takes nothing beyond `id`. convex-helpers throws at push time
 * otherwise ("you must declare the arguments for the function too").
 */
const authorizeDoc = async <T extends OwnedTable>(ctx: Context, id: Id<T>) => {
  const { user, userId } = await userCheckOrThrow(ctx);
  const doc = await checkOwnership({ ...ctx, userId }, id);
  if (!doc || typeof doc === 'boolean') throw new ConvexError("Unauthorized");
  return { ctx: { user, userId, doc: doc as unknown as Doc<T> }, args: {} };
};

export const ownedQuery = <T extends OwnedTable>(table: T) =>
  customQuery(query, {
    args: { id: v.id(table) },
    input: (ctx, { id }) => authorizeDoc<T>(ctx as unknown as Context, id as Id<T>),
  });

export const ownedMutation = <T extends OwnedTable>(table: T) =>
  customMutation(mutation, {
    args: { id: v.id(table) },
    input: (ctx, { id }) => authorizeDoc<T>(ctx as unknown as Context, id as Id<T>),
  });

