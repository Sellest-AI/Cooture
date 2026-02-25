import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../../procedures";
import { NOTIFICATION_TYPE } from '../../schema/notifications';

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

type PushNotification = {
  title: string,
  body: string,
}

const createPushNotification = (args: Args<Type>): PushNotification => {
  switch (args.type) {
    case "generation_ready":
      return {
        title: "Your generation is ready!",
        body: "Tap to view your new post.",
      }
    case "tagged_in_generation":
      return {
        title: "You were tagged in a generation!",
        body: "Tap to view the generation you were tagged in.",
      }
    case "new_follower":
      return {
        title: "You have a new follower!",
        body: "Tap to view their profile.",
      }
    case "new_like":
      return {
        title: "Your content got a new like!",
        body: "Tap to view who's liking your content.",
      }
  }
}

const getUserId = async (ctx: QueryCtx, args: Args<Type>) => {
  switch (args.type) {
    case "generation_ready":
      return (await ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first())?.userId;
    case "tagged_in_generation":
      return (await ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first())?.userId;
    case "new_follower":
      return args.actorId;
    case "new_like":
      if (args.generationId) {
        return (await ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first())?.userId;
      } else if (args.outfitId) {
        return (await ctx.db.query("outfits").withIndex("by_id", q => q.eq("_id", args.outfitId)).first())?.userId;
      }
  }
}

export const saveNotification = async <T extends Type>(ctx: MutationCtx, args: Args<T>) => {
  const existingNotification = await ctx.db.query("notifications")
    .withIndex("by_aggregation_key", q => q.eq("aggregationKey", aggregationKey(args)))
    .order("desc")
    .first();

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const THIRTY_MINUTES = 30 * 60 * 1000;

  // Notifications can be stacked up to 30 minutes OR until a hard cap of 1 day after the first notification in the stack, whichever comes first.
  // After that, a new notification will be created to avoid stacking too many notifications together or keeping notifications in the stack for too long.
  const NEW_AGGREGATION_WINDOW = now + THIRTY_MINUTES;

  if (existingNotification) {
    const withinWindow = (existingNotification.aggregatedUntil ?? 0) >= now;
    const withinHardCap = (existingNotification._creationTime + ONE_DAY) >= now;

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

  const userId = args.userId ?? await getUserId(ctx, args);
  if (!userId) throw new Error("Unable to determine userId for notification");

  // Schedule a push notification to be sent immediately with the notification details to user's decides. 
  if (args.pushToDevice)
    await ctx.scheduler.runAfter(0, internal.router.notifications.sendPushNotification._internal, {
      ...createPushNotification(args),
      data: args,
      userId: userId,
      type: args.type,
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