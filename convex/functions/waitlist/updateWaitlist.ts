import { MutationCtx } from "../../procedures";

type Args = {
  addUsers?: number;
  addCodes?: number;
  addCodeUsed?: boolean;
}


export const updateWaitlist = async (ctx: MutationCtx, args: Args) => {
  const { addUsers = 0, addCodes = 0, addCodeUsed = false } = args;

  const stats = await ctx.db.query('waitlist').first();
  if (!stats) return false;

  await ctx.db.patch(stats._id, {
    numberOfUsers: addUsers > 0 ? stats.numberOfUsers + addUsers : stats.numberOfUsers,
    numberOfCodes: stats.numberOfCodes + addCodes,
    numberOfUsedCodes: addCodeUsed ? stats.numberOfUsedCodes + 1 : stats.numberOfUsedCodes,
  })

  return true;
}