import { Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";

export const getVideo = (ctx: QueryCtx, id: Id<'videos'>) => {
  const video = ctx.db.get(id);
  return video;
}