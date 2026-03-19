import { MutationCtx } from "../../procedures";

type Args = {
  addUsersIn?: number;
  addUsersOut?: number;
  addCodes?: number;
  addCodeUsed?: boolean;
}


export const updateWaitlist = async (ctx: MutationCtx, args: Args) => {
  const { addUsersIn = 0, addUsersOut = 0, addCodes = 0, addCodeUsed = false } = args;

  const stats = await ctx.db.query('waitlist').first();
  if (!stats) return false;

  await ctx.db.patch(stats._id, {
    numberOfUsersIn: addUsersIn > 0 ? stats.numberOfUsersIn + addUsersIn : stats.numberOfUsersIn,
    numberOfUsersOut: addUsersOut > 0 ? stats.numberOfUsersOut + addUsersOut : stats.numberOfUsersOut,
    numberOfCodes: stats.numberOfCodes + addCodes,
    numberOfUsedCodes: addCodeUsed ? stats.numberOfUsedCodes + 1 : stats.numberOfUsedCodes,
  })

  return true;
}