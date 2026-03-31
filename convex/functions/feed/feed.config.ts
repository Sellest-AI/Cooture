export const FEED_CONFIG = {
  DEFAULT_SCORE: 10000,
  RANDOM_SCORE_RANGE: 4000, // Range for random score to add (0 to 4000)
  FREEZE_AGE_HOURS: 168, // Posts older than 7 days (168h) get frozen
  FREEZE_DECAY_PERCENT: 90, // At freeze time, base score is reduced by this % (0-100)

  // Weight for extra score based on likes (e.g. 100 points per like)
  LIKES_WEIGHT: 200,
  SAVES_WEIGHT: 700,

  // Weight for extra score based on post type
  VIDEO_WEIGHT: 4000,
  PRESET_WEIGHT: 1000,
  OUTFIT_WEIGHT: 2000,
}