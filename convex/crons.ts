import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { FEED_CONFIG } from "./functions/feed";
// import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//   "clear tasks",
//   { minutes: 1 }, // every minute
//   internal.messages.clearAll,
// );

crons.interval(
  "update recent feed scores (0h to 72h)",
  { hours: 1 }, // every 1 hour
  internal.crons.feedRecentUpdate._internal,
  { minAgeHours: 0, maxAgeHours: 72 }
)

crons.interval(
  "update feed scores (72h to 7 days)",
  { hours: 24 }, // every 24 hours
  internal.crons.feedRecentUpdate._internal,
  { minAgeHours: 72, maxAgeHours: FEED_CONFIG.FREEZE_AGE_HOURS + 24 }
)

// Update statistics every 24 hours
crons.interval(
  "update admin statistics",
  { hours: 24 }, // every 24 hours
  internal.crons.updateStatistics._internal,
)

crons.interval(
  "send notifications for predictions in review for less than 3 days",
  { hours: 12 }, // every 12 hours
  internal.crons.notifyInReviews._internal,
  { maxAgeDays: 3 }
)

export default crons;