import { DAY, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

/**
 * Per-user ceilings on features that call paid providers. Credits already bound most of
 * them; these cover the ones that are free to the user (previews) and cap the rest so a
 * single account cannot run up the provider bill.
 *
 * Token buckets: `rate` tokens refill per `period`, at most `capacity` stored.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  /** Replicate images rendered by preset previews — counted per image, not per call. */
  presetPreviewImages: { kind: "token bucket", rate: 30, period: DAY, capacity: 30 },
  /** Preset creations (LLM prompt extraction + depth map). */
  presetCreation: { kind: "token bucket", rate: 10, period: DAY, capacity: 10 },
});
