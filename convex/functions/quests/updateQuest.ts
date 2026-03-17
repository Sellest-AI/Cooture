import { internal } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import { ActionCtx, MutationCtx } from "../../procedures";
import { QuestType } from "../../schema/quests";

type DefaultArgs = {
  userId: Id<'users'>,
  questType: QuestType,
}

type BaseCtx = ActionCtx | MutationCtx;

type ArgsExtended = { increment: number; decrement?: never } | { decrement: number; increment?: never };

export function updateQuest(ctx: BaseCtx & { userId: Id<'users'> }, args: Omit<DefaultArgs, 'userId'> & ArgsExtended): Promise<any>;
export function updateQuest(ctx: BaseCtx, args: DefaultArgs & ArgsExtended): Promise<any>;
export async function updateQuest(ctx: any, args: any) {
  const userId = args.userId ?? ctx.userId;
  return ctx.runMutation(internal.router.quests.updateOne._internal, { ...args, userId });
}