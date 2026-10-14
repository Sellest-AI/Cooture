import { Doc, Id } from "../../_generated/dataModel";

type Viewer = { userId: Id<'users'>, user: { role?: Doc<'usersExtended'>['role'] } } | null;

/** The owner and admins see every prediction of a generation, drafts included. */
export const canReadDrafts = (viewer: Viewer, generation: Pick<Doc<'generations'>, 'userId'>) =>
  !!viewer && (viewer.userId === generation.userId || viewer.user.role === 'ADMIN');

/**
 * The predictions anyone else may see: ACCEPTED, and part of a published version.
 *
 * Adding predictions to a generation resets it to DRAFT. `completedAt` is the newest
 * prediction's `readyAt` at the moment it last completed, so predictions with
 * `readyAt <= completedAt` were in that version and stay visible, while anything generated
 * since stays hidden until the owner publishes again. A generation that never completed
 * (or was archived with everything rejected) therefore shows nothing.
 */
export const publicPredictions = <P extends Pick<Doc<'predictions'>, 'status' | 'readyAt'>>(
  generation: Pick<Doc<'generations'>, 'publication' | 'completedAt'>,
  predictions: P[],
): P[] => {
  const accepted = predictions.filter((p) => p.status === 'ACCEPTED');
  if (generation.publication === 'PUBLISHED') return accepted;

  const completedAt = generation.completedAt;
  if (generation.publication !== 'DRAFT' || completedAt === undefined) return [];
  return accepted.filter((p) => (p.readyAt ?? 0) <= completedAt);
};
