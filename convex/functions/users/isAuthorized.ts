import { Doc, Id } from "../../_generated/dataModel";
import { QueryCtx } from "../../procedures";

type Context = QueryCtx & { userId: Id<'users'> };

type IdExtended = Id<'generations'> | Id<'outfits'> | Id<'items'> | Id<'predictions'>;

type TableFromId<T extends IdExtended> =
  T extends Id<'generations'> ? 'generations' :
  T extends Id<'outfits'> ? 'outfits' :
  T extends Id<'items'> ? 'items' :
  T extends Id<'predictions'> ? 'predictions' :
  never;

type Args<T extends IdExtended> = T | Doc<TableFromId<T>>;

type Returned<T extends IdExtended> = T extends Id<'generations'> ? Doc<'generations'> :
  T extends Id<'outfits'> ? Doc<'outfits'> :
  T extends Id<'items'> ? Doc<'items'> :
  boolean;

const throwOrReturn = (throwOnFail?: boolean) => {
  if (throwOnFail) throw new Error("User is not authorized");
  return false;
}

export const isAuthorized = async <T extends IdExtended>(
  ctx: Context,
  args: Args<T>,
  options?: { throwOnFail?: boolean }
): Promise<Returned<T> | boolean> => {
  const throwOnFail = options?.throwOnFail ?? true;

  const userId = ctx.userId;

  const doc = typeof args === "string" ? await ctx.db.get(args) : args;

  if (!doc) return throwOrReturn(throwOnFail);

  if ("userId" in doc && doc.userId === userId) {
    return doc as Returned<T>;
  }

  if ("generationId" in doc && doc.generationId) {
    const generation = await ctx.db.get(doc.generationId);

    if (!generation) return throwOrReturn(throwOnFail);

    if ("userId" in generation)
      if (generation?.userId === userId)
        return doc as unknown as Returned<T>;
  }

  return throwOrReturn(throwOnFail);
};