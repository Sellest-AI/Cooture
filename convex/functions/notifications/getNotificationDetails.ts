import { Doc } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getGenerationMax } from "../generations";
import { getOutfit } from "../outfits";
import { getPreset } from "../presets";
import { getUserPublic } from "../users";

export const getNotificationDetails = async (ctx: QueryCtx, notification: Doc<'notifications'>) => {
  const [actor, generation, outfit, preset, quest, rawTransaction] = await Promise.all([
    notification.actorId ? getUserPublic(ctx, notification.actorId) : null,
    notification.generationId ? getGenerationMax(ctx, notification.generationId) : null,
    notification.outfitId ? getOutfit(ctx, notification.outfitId) : null,
    notification.presetId ? getPreset(ctx, notification.presetId) : null,
    notification.questId ? ctx.db.get(notification.questId) : null,
    notification.transactionId ? ctx.db.get(notification.transactionId) : null,
  ])

  const aggregationCount = notification.aggregationCount ?? 1;

  const transaction = rawTransaction ? {
    amount: rawTransaction.amount,
    type: rawTransaction.type,
  } : null;

  return {
    ...notification,
    aggregationCount,
    transaction,
    outfit,
    generation,
    actor,
    preset,
    quest
  }
}