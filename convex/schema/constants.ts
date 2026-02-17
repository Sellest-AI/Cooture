import { v } from "convex/values";

const CONTENT_RATINGS_C = ["SAFE", "SUGGESTIVE", "EXPLICIT", "NSFW"] as const;

export const CONTENT_RATINGS = v.union(
  ...CONTENT_RATINGS_C.map(v.literal)
)

export const CONTENT_RATINGS_ORDER = CONTENT_RATINGS_C.reduce((acc, rating, index) => {
  acc[rating] = index;
  return acc;
}, {} as Record<typeof CONTENT_RATINGS_C[number], number>)