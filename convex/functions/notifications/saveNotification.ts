import { Nullable, ROUTES } from "@shared/utils";
import { internal } from "../../_generated/api";
import { Doc, Id } from "../../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../../procedures";
import { NOTIFICATION_CHANNEL, NOTIFICATION_TYPE } from '../../schema/notifications';

type Type = typeof NOTIFICATION_TYPE['type'];

type SingleObject = { generationId: Id<'generations'>, outfitId?: never } | { generationId?: never, outfitId: Id<'outfits'> }
type NewLike = { type: "new_like", actorId: Id<'users'> } & SingleObject

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

type OutfitUsed = {
  type: "outfit_used",
  outfitId: Id<'outfits'>,
  /** The actor who used the outfit */
  actorId: Id<'users'>,
}

type PresetUsed = {
  type: "preset_used",
  presetId: Id<'presets'>,
  /** The actor who used the preset */
  actorId: Id<'users'>,
}

type QuestProgress = {
  type: "quest_progress",
  /** The user whose quest progress is updated */
  actorId: Id<'users'>,
  questTitle: string,
  rewardCredits?: number,
}

type Args<T extends Type> = {
  type: T,
  /** The user to notify */
  userId?: Id<'users'>,
  pushToDevice?: boolean,
  /** Delay before pushing the notification (in milliseconds) */
  delayPushMs?: number,
} & (
    T extends "generation_ready" ? GenerationReady :
    T extends "new_like" ? NewLike :
    T extends "new_follower" ? NewFollower :
    T extends "tagged_in_generation" ? TaggedInGeneration :
    T extends "outfit_used" ? OutfitUsed :
    T extends "preset_used" ? PresetUsed :
    T extends "quest_progress" ? QuestProgress :
    never
  )

type GenerationExtended = Doc<'generations'> & { coverUrl?: string }
type OutfitExtended = Doc<'outfits'> & { coverUrl?: string }
type PresetExtended = Doc<'presets'> & { coverUrl?: string }

type ArgsExtended<T extends Type> = Args<T> & (
  T extends "generation_ready" ? { generation: Nullable<GenerationExtended>, type: "generation_ready" } :
  T extends "tagged_in_generation" ? { generation: Nullable<Doc<'generations'>>, type: "tagged_in_generation" } :
  T extends "new_like" ? { generation?: Nullable<GenerationExtended>, outfit?: Nullable<OutfitExtended>, actor?: Nullable<Doc<'usersExtended'>>, type: "new_like" } :
  T extends "new_follower" ? { follower: Nullable<Doc<'usersExtended'>>, type: "new_follower" } :
  T extends "outfit_used" ? { outfit: Nullable<OutfitExtended>, type: "outfit_used", actor?: Nullable<Doc<'usersExtended'>> } :
  T extends "preset_used" ? { preset: Nullable<PresetExtended>, type: "preset_used", actor?: Nullable<Doc<'usersExtended'>> } :
  T extends "quest_progress" ? { questTitle: string, rewardCredits?: number, type: "quest_progress" } :
  never
)

type PushNotification = {
  title: string,
  body: string,
  image?: string;
  icon?: string;
  redirectUrl?: string;
}

const createPushNotification = async (args: ArgsExtended<Type>, notification?: Doc<'notifications'> | null): Promise<PushNotification> => {
  const FALLBACK_ROUTE = ROUTES.EXTRA.NOTIFICATIONS;

  const aggregationCount = notification?.aggregationCount ?? 0;

  switch (args.type) {
    case "quest_progress":
      return {
        title: `Quest progress: ${args.questTitle}`,
        body: Number(args.rewardCredits) > 0 ?
          `You earned ${args.rewardCredits} credits! Tap to view your quests.` :
          `Tap to view your quests.`,
        redirectUrl: ROUTES.COLLECTION.PATH,
      }
    case "generation_ready":
      return {
        title: "Your generation is ready",
        body: "Tap to view",
        image: args.generation?.coverUrl,
        redirectUrl: ROUTES.GENERATIONS.PHOTOSHOOT.ID(args.generationId)
      }
    case "tagged_in_generation":
      return {
        title: "📷 You were tagged in a generation",
        body: "Tap to view",
        redirectUrl: FALLBACK_ROUTE
      }
    case "new_follower":
      return {
        title: "You have a new follower",
        body: "Tap to view",
        icon: args.follower?.imageUrl,
        redirectUrl: args.follower ? ROUTES.USER.ID(args.follower._id) : FALLBACK_ROUTE
      }
    case "new_like":
      if (aggregationCount > 1)
        return {
          title: `${args.actor?.name ?? "Someone"} and ${aggregationCount} others liked your post`,
          body: "Tap to view",
          icon: args.actor?.imageUrl,
          image: args.generation?.coverUrl,
          redirectUrl: FALLBACK_ROUTE
        }
      return {
        title: `${args.actor?.name ?? "Someone"} liked your post`,
        body: "Tap to view",
        icon: args.actor?.imageUrl,
        image: args.generation?.coverUrl,
        redirectUrl: FALLBACK_ROUTE
      }
    case "preset_used":
      return {
        title:
          aggregationCount > 1 ? `📷 +${aggregationCount} people used your preset` :
            `📷 ${args.actor?.name ?? "Someone"} used your preset`,
        body: "Tap to view",
        icon: args.actor?.imageUrl,
        image: args.preset?.coverUrl,
        redirectUrl: FALLBACK_ROUTE
      }
    case "outfit_used":
      return {
        title:
          aggregationCount > 1 ? `👕 +${aggregationCount} people used your outfit` :
            `👕 ${args.actor?.name ?? "Someone"} used your outfit`,
        body: "Tap to view",
        icon: args.actor?.imageUrl,
        image: args.outfit?.coverUrl,
        redirectUrl: ROUTES.SHARE.USER(args.actorId)
      }
  }
}

const aggregationKey = (args: Args<Type>) => {
  switch (args.type) {
    case "quest_progress":
      return `quest_progress:${args.actorId}:${args.questTitle}`
    case "generation_ready":
      return `generation_ready:${args.actorId}:${args.generationId}`
    case "tagged_in_generation":
      return `tagged_in_generation:${args.userId}:${args.generationId}`
    case "new_follower":
      return `new_follower:${args.userId}`
    case "new_like":
      return `new_like:${args.userId}:${args.generationId ?? args.outfitId}`
    case "outfit_used":
      return `outfit_used:${args.outfitId}`
    case "preset_used":
      return `preset_used:${args.presetId}`
  }
}

const getUserId = (args: ArgsExtended<Type>) => {
  switch (args.type) {
    case "quest_progress":
      return args.userId ?? args.actorId;
    case "generation_ready":
      return args.generation?.userId;
    case "tagged_in_generation":
      return args.userId;
    case "new_follower":
      return args.actorId;
    case "new_like":
      return args.generation?.userId ?? args.outfit?.userId;
    case "outfit_used":
      return args.outfit?.userId;
    case "preset_used":
      return args.preset?.userId;
  }
}

async function getObjects(ctx: QueryCtx, args: Args<Type>): Promise<ArgsExtended<Type>> {
  if (args.type === "generation_ready") {
    const [generation, predictions] = await Promise.all([
      ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first(),
      ctx.db.query("predictions").withIndex("by_generation_id", q => q.eq("generationId", args.generationId)).collect()
    ]);
    const coverId = predictions.find((p) => p.status === 'ACCEPTED')?.imageId ?? predictions[0]?.imageId;
    const cover = coverId ? await ctx.db.get(coverId) : undefined;
    return { ...args, generation: generation ? { ...generation, coverUrl: cover?.url } : undefined };
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
    const actor = await ctx.db.query("usersExtended").withIndex("by_user_id", q => q.eq("userId", args.actorId)).first();
    if (args.generationId) {
      const [generation, predictions] = await Promise.all([
        ctx.db.query("generations").withIndex("by_id", q => q.eq("_id", args.generationId)).first(),
        ctx.db.query("predictions").withIndex("by_generation_id", q => q.eq("generationId", args.generationId)).collect()
      ]);
      const coverId = predictions.find((p) => p.status === 'ACCEPTED')?.imageId ?? predictions[0]?.imageId;
      const cover = coverId ? await ctx.db.get(coverId) : undefined;
      return { ...args, generation: generation ? { ...generation, coverUrl: cover?.url } : undefined, actor };
    }
    else if (args.outfitId) {
      const outfit = await ctx.db.query("outfits").withIndex("by_id", q => q.eq("_id", args.outfitId)).first();
      const cover = outfit?.coverId ? await ctx.db.get(outfit.coverId) : undefined;
      return { ...args, outfit: outfit ? { ...outfit, coverUrl: cover?.url } : undefined, actor };
    }
  }

  if (args.type === "outfit_used") {
    const outfit = await ctx.db.query("outfits").withIndex("by_id", q => q.eq("_id", args.outfitId)).first();
    const actor = await ctx.db.query("usersExtended").withIndex("by_user_id", q => q.eq("userId", args.actorId)).first();
    const cover = outfit?.coverId ? await ctx.db.get(outfit.coverId) : undefined;
    return { ...args, outfit: outfit ? { ...outfit, coverUrl: cover?.url } : undefined, actor };
  }

  if (args.type === "preset_used") {
    const preset = await ctx.db.query("presets").withIndex("by_id", q => q.eq("_id", args.presetId)).first();
    const actor = await ctx.db.query("usersExtended").withIndex("by_user_id", q => q.eq("userId", args.actorId)).first();
    const cover = preset?.imageIds?.[0] ? await ctx.db.get(preset.imageIds[0]) : undefined;
    return { ...args, preset: preset ? { ...preset, coverUrl: cover?.url } : undefined, actor };
  }

  if (args.type === "quest_progress") {
    return { ...args };
  }

  return args;
}

const isNotificationAllowed = (args: ArgsExtended<Type>) => {
  const userId = args.userId ?? getUserId(args);

  if (args.type === "generation_ready") return true;
  if (args.type === "quest_progress") return true;

  // Don't allow notifications if the actor is the same as the user (e.g. liking your own generation, following yourself, etc.)
  if (userId === args.actorId) return false;

  return true;
}

export const saveNotification = async <T extends Type>(ctx: MutationCtx, args: Args<T>): Promise<Id<'notifications'> | false> => {
  const [objectsArgs, existingNotification] = await Promise.all([
    getObjects(ctx, args),
    ctx.db.query("notifications")
      .withIndex("by_aggregation_key", q => q.eq("aggregationKey", aggregationKey(args)))
      .order("desc")
      .first(),
  ])

  const argsExtended = { ...args, ...objectsArgs } as ArgsExtended<Type>;

  // Don't create or update notifications if the action is performed by the same user (e.g. liking your own generation, following yourself, etc.)
  if (!isNotificationAllowed(argsExtended)) return false;

  const userId = args.userId ?? getUserId(argsExtended);
  if (!userId) return false;

  const sendPushNotification = async () => {
    if (!args.pushToDevice) return false;
    // Schedule a push notification to be sent immediately with the notification details to user's decides. 
    const result = await ctx.scheduler.runAfter((args.delayPushMs ?? 0), internal.router.notifications.sendPushNotification._internal, {
      ...(await createPushNotification(argsExtended, existingNotification)),
      data: argsExtended,
      userId: userId,
      channelId: NOTIFICATION_CHANNEL[args.type],
    })

    return !!result;
  }

  const now = Date.now();
  const HARD_CAP_DELAY = 24 * 60 * 60 * 1000; // 24 hours
  const WINDOW_DELAY = 6 * 60 * 60 * 1000; // 6 hours

  // How many time before a push notification is sent again
  const PUSH_NOTIFICATION_RATE = 5 * 60 * 60 * 1000; // 5 hours

  // Notifications can be stacked up to "X time" OR until a hard cap of "Y time" after the first notification in the stack, whichever comes first.
  // After that, a new notification will be created to avoid stacking too many notifications together or keeping notifications in the stack for too long.
  const NEW_AGGREGATION_WINDOW = now + WINDOW_DELAY;

  if (existingNotification) {
    const withinWindow = (existingNotification.aggregatedUntil ?? 0) >= now;
    const withinHardCap = (existingNotification._creationTime + HARD_CAP_DELAY) >= now;

    // Can aggregate if notification unread OR if it's within both the aggregation window and hard cap.
    const canAggregate = !existingNotification.read || (withinWindow && withinHardCap);

    // Only send a push notification if we're outside of the aggregation window to avoid sending too many push notifications for the same action. 
    const canSendPush = (existingNotification.lastPushSentAt ?? 0) + PUSH_NOTIFICATION_RATE <= now;

    if (canAggregate) {
      if (existingNotification.actorId === args.actorId)
        return false; // Don't update if the same actor is performing the action again

      // Only send a push notification every X time
      const notificationPushed = canSendPush ? await sendPushNotification() : false;

      await ctx.db.patch(existingNotification._id, {
        read: false,
        actorId: args.actorId,
        lastPushSentAt: notificationPushed ? now : existingNotification.lastPushSentAt,
        aggregationCount: (existingNotification.aggregationCount ?? 1) + 1,
        aggregatedUntil: NEW_AGGREGATION_WINDOW, // still extend the window
        updatedAt: now,
      });

      return existingNotification._id;
    }
  }

  const notificationPushed = await sendPushNotification();

  return ctx.db.insert("notifications", {
    userId: userId,
    type: args.type,
    read: false,
    actorId: args.actorId,
    generationId: "generationId" in args ? args.generationId : undefined,
    outfitId: "outfitId" in args ? args.outfitId : undefined,
    presetId: "presetId" in args ? args.presetId : undefined,
    aggregationCount: 1,
    aggregationKey: aggregationKey(args),
    aggregatedUntil: NEW_AGGREGATION_WINDOW,
    lastPushSentAt: notificationPushed ? now : undefined,
    updatedAt: now,
  })
}