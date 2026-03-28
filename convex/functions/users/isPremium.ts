import { Doc } from "../../_generated/dataModel";
import { ActionCtx, MutationCtx, QueryCtx } from "../../procedures";

type Ctx = QueryCtx | ActionCtx | MutationCtx;

type Options = {
  throwOnReject?: boolean;
}

type AuthCtx = Ctx & {
  user: Pick<Doc<'usersExtended'>, 'plan' | 'role'>
}

export const isPremium = async (ctx: AuthCtx, options?: Options) => {
  const throwOnReject = options?.throwOnReject ?? true;
  const user = ctx.user;

  const isAdmin = user.role === "ADMIN";
  if (isAdmin) return true;

  const isBot = user.role === 'BOT';
  if (isBot) return true;

  // If user has a plan, he's premium;
  const isPremium = !!user?.plan?.id;

  if (!isPremium && throwOnReject) { throw new Error("User is not premium") }

  return isPremium;
}