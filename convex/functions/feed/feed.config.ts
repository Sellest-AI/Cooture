export const FEED_CONFIG = {
  DEFAULT_SCORE: 10000,
  RANDOM_SCORE_RANGE: 4000, // Range for random score to add (0 to 4000)
  FREEZE_AGE_HOURS: 168, // Posts older than 7 days (168h) get frozen
  FREEZE_DECAY_PERCENT: 90, // At freeze time, base score is reduced by this % (0-100)

  // Weight for extra score based on likes (e.g. 100 points per like)
  LIKES_WEIGHT: 300,
  SAVES_WEIGHT: 1000,

  // Weight for carousel length
  CAROUSEL_WEIGHT: 1000, // each extra slide adds 1000 points

  // Weight for extra score based on post type
  VIDEO_WEIGHT: 1200,
  PRESET_WEIGHT: 200,
  OUTFIT_WEIGHT: 1000,

  // Penalty decay for posts
  ITEMS_PENALTY_DECAY: 0.7, // 70% decay if multiple items of the same category (except accessories)
}