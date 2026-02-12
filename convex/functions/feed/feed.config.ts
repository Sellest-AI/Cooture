export const FEED_CONFIG = {
  DEFAULT_SCORE: 10000,
  RANDOM_SCORE_RANGE: 4000, // Range for random score to add (0 to 4000)
  HOURLY_DECAY: 150, // Posts lose relevance over ~3 days
  FREEZE_AGE_HOURS: 168, // Posts older than 7 days (168h) get frozen
}