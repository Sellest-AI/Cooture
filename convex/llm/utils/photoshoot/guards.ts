import { internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { ActionCtx } from "../../../_generated/server";

/** Upper bound on images per photoshoot request — each one is a paid provider call. */
export const MAX_IMAGES_PER_GENERATION = 4;

/** Rejects fractional, non-finite, zero, negative and oversized image counts. */
export const parseNumberToGenerate = (value: number | undefined) => {
  const count = value ?? 1;
  if (!Number.isInteger(count) || count < 1 || count > MAX_IMAGES_PER_GENERATION)
    throw new Error(`numberToGenerate must be an integer between 1 and ${MAX_IMAGES_PER_GENERATION}`);
  return count;
};

/**
 * Appending to an existing generation resets it to DRAFT and adds predictions to it, so
 * the generation must belong to the user the photoshoot is generated for.
 */
export const assertGenerationOwner = async (ctx: ActionCtx, userId: Id<'users'>, generationId?: Id<'generations'>) => {
  if (!generationId) return;
  await ctx.runQuery(internal.utils.isAuthorized._internal, { userId, id: generationId });
};
