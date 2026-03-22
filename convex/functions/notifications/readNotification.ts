import { Id } from "../../_generated/dataModel";
import { MutationCtx } from "../../procedures";

type Args = {
  userId: Id<'users'>;
  generationId: Id<'generations'>;
  type: 'generation_ready';
}

/** Reads unread notifications for a user and marks them as read */
export const readNotification = async (ctx: MutationCtx, args: Args) => {
  const { generationId, type, userId } = args;

  const notifications = await ctx.db.query("notifications")
    .withIndex("by_user_read", q => q.eq("userId", userId).eq("read", false))
    .order("desc").take(200);

  const generationIds = notifications.filter((n) => n.type === type && n.generationId === generationId);

  await Promise.all(generationIds.map((n) => ctx.db.patch(n._id, { read: true })));
}