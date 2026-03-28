import { Doc } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";
import { getGenerationMax } from "../generations";
import { getOutfit } from "../outfits";
import { getPreset } from "../presets";
import { getUserPublic } from "../users";

export const getNotificationDetails = async (ctx: QueryCtx, notification: Doc<'notifications'>) => {
  const [actor, generation, outfit, preset] = await Promise.all([
    notification.actorId ? getUserPublic(ctx, notification.actorId) : null,
    notification.generationId ? getGenerationMax(ctx, notification.generationId) : null,
    notification.outfitId ? getOutfit(ctx, notification.outfitId) : null,
    notification.presetId ? getPreset(ctx, notification.presetId) : null,
  ])

  const aggregationCount = notification.aggregationCount ?? 1;

  return {
    ...notification,
    aggregationCount,
    outfit,
    generation,
    actor,
    preset,
  }
}