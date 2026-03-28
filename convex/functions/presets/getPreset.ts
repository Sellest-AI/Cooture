import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";

export const getPreset = async (ctx: QueryCtx, presetId: Id<'presets'>) => {
  const preset = await ctx.db.get(presetId);
  return preset;
}