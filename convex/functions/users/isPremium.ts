import { ActionCtx, MutationCtx, QueryCtx, userCheck } from "../../procedures";

type User = Awaited<ReturnType<typeof userCheck>>;
type Ctx = QueryCtx | ActionCtx | MutationCtx;

type Options = {
  throwOnReject?: boolean;
}

export const isPremium = async (ctx: Ctx & User, options?: Options) => {
  const user = ctx.user;

  const isAdmin = user.role === "ADMIN";
  if (isAdmin) return true;

  // If user has a plan, he's premium;
  const isPremium = !!user?.plan?.id;

  if (!isPremium && options?.throwOnReject) { throw new Error("User is not premium") }

  return isPremium;
}