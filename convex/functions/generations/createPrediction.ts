import { internal } from "../../_generated/api";
import { Doc } from "../../_generated/dataModel";
import { MutationCtx } from "../../procedures";

type Args = Omit<Doc<'predictions'>, '_id' | '_creationTime'>;

export const createPrediction = async (ctx: MutationCtx, args: Args) => {
  const predictionId = await ctx.db.insert('predictions', {
    ...args,
  });

  // If the prediction is still loading after 15 minutes, 
  // we consider that something went wrong with the generation and we auto refund the user
  await ctx.scheduler.runAfter(15 * 60 * 1000, internal.router.generations.autoRefund._internal, {
    predictionId,
  });

  return predictionId;
}