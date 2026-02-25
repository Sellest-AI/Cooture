import { Nullable, ROUTES } from "@shared/utils";
import { internal } from "../../_generated/api";
import { Doc, Id } from "../../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../../procedures";
import { NOTIFICATION_CHANNEL, NOTIFICATION_TYPE } from '../../schema/notifications';

type Type = typeof NOTIFICATION_TYPE['type'];
type SingleObject = { generationId: Id<'generations'>, outfitId?: never } |
{ generationId?: never, outfitId: Id<'outfits'> }

type GenerationReady = {
  type: "generation_ready",
  generationId: Id<'generations'>,
  /** The actor who triggered the notification */
  actorId: Id<'users'>,
}

type TaggedInGeneration = {
  type: "tagged_in_generation",
  generationId: Id<'generations'>,
  /** The actor who tagged you */
  actorId: Id<'users'>,
  userId: Id<'users'>,
}

type NewFollower = { type: "new_follower", actorId: Id<'users'>, userId: Id<'users'> }

type NewLike = { type: "new_like", actorId: Id<'users'> } & SingleObject

type Args<T extends Type> = {
  type: T,
  userId?: Id<'users'>,
  pushToDevice?: boolean,
} & (
    T extends "generation_ready" ? GenerationReady :
    T extends "new_like" ? NewLike :
    T extends "new_follower" ? NewFollower :
    T extends "tagged_in_generation" ? TaggedInGeneration :
    never
  )

type ArgsExtended<T extends Type> = Args<T> & (
  T extends "generation_ready" ? { generation: Nullable<Doc<'generations'>>, type: "generation_ready" } :
  T extends "tagged_in_generation" ? { generation: Nullable<Doc<'generations'>>, type: "tagged_in_generation" } :
  T extends "new_like" ? { generation?: Nullable<Doc<'generations'>>, outfit?: Nullable<Doc<'outfits'>>, user?: Nullable<Doc<'usersExtended'>>, type: "new_like" } :
  T extends "new_follower" ? { follower: Nullable<Doc<'usersExtended'>>, type: "new_follower" } :
  never
)

type PushNotification = {
  title: string,
  body: string,
  image?: string;
  redirectUrl?: string;
}

const createPushNotification = async (args: ArgsExtended<Type>, notification?: Doc<'notifications'> | null): Promise<PushNotification> => {
  const FALLBACK_ROUTE = ROUTES.EXTRA.NOTIFICATIONS;

  const aggregationCount = notification?.aggregationCount ?? 0;

  switch (args.type) {
    case "generation_ready":
      return {
        title: "Your generation is ready",
        body: "Tap to view",
        redirectUrl: ROUTES.PHOTOSHOOT.GENERATIONS.ID(args.generationId)
      }
    case "tagged_in_generation":
      return {
        title: "You were tagged in a generation",
        body: "Tap to view",
        redirectUrl: FALLBACK_ROUTE
      }
    case "new_follower":
      return {
        title: "You have a new follower",
        body: "Tap to view",
        image: args.follower?.imageUrl,
        redirectUrl: args.follower ? ROUTES.USER.ID(args.follower._id) : FALLBACK_ROUTE
      }
    case "new_like":
      if (aggregationCount > 2)
        return {
          title: `+${aggregationCount} people liked your post`,
          body: "Tap to view",
          image: args.user?.imageUrl,
          redirectUrl: FALLBACK_ROUTE
        }

      return {
        title: "Your content got a new like",
        body: "Tap to view",
        image: args.user?.imageUrl,
        redirectUrl: FALLBACK_ROUTE
      }
  }
}

const aggregationKey = (args: Args<Type>) => {
  switch (args.type) {
    case "generation_ready":
      return `generation_ready:${args.userId}:${args.generationId}`
    case "tagged_in_generation":
      return `tagged_in_generation:${args.userId}:${args.generationId}`
    case "new_follower":
      return `new_follower:${args.userId}`
    case "new_like":
      return `new_like:${args.userId}:${args.generationId ?? args.outfitId}`
  }
}

const getUserId = (args: ArgsExtended<Type>) => {
  switch (args.type) {
    case "generation_ready":
      return args.generation?.userId;
    case "tagged_in_generation":
      return args.generation?.userId;
    case "new_follower":
      return args.actorId;
    case "new_like":
      return args.generation?.userId ?? args.outfit?.userId;
  }
}

async function getObjects(ctx: QueryCtx, args: Args<Type>): Promise<ArgsExtended<Type>> {
  if (args.type === "generation_ready") {
    const generation = await ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first();
    return { ...args, generation };
  }

  if (args.type === "tagged_in_generation") {
    const taggedGeneration = await ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first();
    return { ...args, generation: taggedGeneration };
  }

  if (args.type === "new_follower") {
    const follower = await ctx.db.query("usersExtended").withIndex("by_user_id", q => q.eq("userId", args.actorId)).first();
    return { ...args, follower };
  }

  if (args.type === "new_like") {
    const user = await ctx.db.query("usersExtended").withIndex("by_user_id", q => q.eq("userId", args.actorId)).first();
    if (args.generationId) {
      const generation = await ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first();
      return { ...args, generation, user };
    }
    else if (args.outfitId) {
      const outfit = await ctx.db.query("outfits").withIndex("by_id", q => q.eq("_id", args.outfitId)).first();
      return { ...args, outfit, user };
    }
  }

  return args;
}

const isNotificationAllowed = (args: ArgsExtended<Type>) => {
  const userId = args.userId ?? getUserId(args);

  if (args.type === "generation_ready") return true;

  // Don't allow notifications if the actor is the same as the user (e.g. liking your own generation, following yourself, etc.)
  if (userId === args.actorId) return false;

  return true;
}

export const saveNotification = async <T extends Type>(ctx: MutationCtx, args: Args<T>) => {
  const [objectsArgs, existingNotification] = await Promise.all([
    getObjects(ctx, args),
    ctx.db.query("notifications")
      .withIndex("by_aggregation_key", q => q.eq("aggregationKey", aggregationKey(args)))
      .order("desc")
      .first(),
  ])

  const argsExtended = { ...args, ...objectsArgs } as ArgsExtended<Type>;

  // Don't create or update notifications if the action is performed by the same user (e.g. liking your own generation, following yourself, etc.)
  if (!isNotificationAllowed(argsExtended)) return null;

  const now = Date.now();
  const TEN_HOURS = 10 * 60 * 60 * 1000;
  const THIRTY_MINUTES = 30 * 60 * 1000;

  // Notifications can be stacked up to 30 minutes OR until a hard cap of 1 day after the first notification in the stack, whichever comes first.
  // After that, a new notification will be created to avoid stacking too many notifications together or keeping notifications in the stack for too long.
  const NEW_AGGREGATION_WINDOW = now + THIRTY_MINUTES;

  if (existingNotification) {
    const withinWindow = (existingNotification.aggregatedUntil ?? 0) >= now;
    const withinHardCap = (existingNotification._creationTime + TEN_HOURS) >= now;

    if (withinWindow && withinHardCap) {
      if (existingNotification.actorId === args.actorId)
        return existingNotification._id; // Don't update if the same actor is performing the action again

      await ctx.db.patch(existingNotification._id, {
        read: false,
        actorId: args.actorId,
        aggregationCount: (existingNotification.aggregationCount ?? 1) + 1,
        aggregatedUntil: NEW_AGGREGATION_WINDOW, // still extend the window
        updatedAt: now,
      });
      return existingNotification._id;
    }
  }

  const userId = args.userId ?? getUserId(argsExtended);
  if (!userId) throw new Error("Unable to determine userId for notification");

  // Schedule a push notification to be sent immediately with the notification details to user's decides. 
  if (args.pushToDevice)
    await ctx.scheduler.runAfter(0, internal.router.notifications.sendPushNotification._internal, {
      ...(await createPushNotification(argsExtended, existingNotification)),
      data: argsExtended,
      userId: userId,
      channelId: NOTIFICATION_CHANNEL[args.type],
    })

  return ctx.db.insert("notifications", {
    userId: userId,
    type: args.type,
    read: false,
    actorId: args.actorId,
    generationId: "generationId" in args ? args.generationId : undefined,
    outfitId: "outfitId" in args ? args.outfitId : undefined,
    aggregationKey: aggregationKey(args),
    aggregatedUntil: NEW_AGGREGATION_WINDOW,
    updatedAt: now,
  })
}