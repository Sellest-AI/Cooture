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
  internal.cron.feedRecentUpdate._internal,
  { minAgeHours: 0, maxAgeHours: 72 }
)

crons.interval(
  "update feed scores (72h to 7 days)",
  { hours: 24 }, // every 24 hours
  internal.cron.feedRecentUpdate._internal,
  { minAgeHours: 72, maxAgeHours: FEED_CONFIG.FREEZE_AGE_HOURS + 24 }
)

// Update statistics every 6 hours
crons.interval(
  "update admin statistics",
  { hours: 6 }, // every 6 hours
  internal.cron.updateStatistics.updateAll,
)

export default crons;