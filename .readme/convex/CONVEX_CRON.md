### `cron.ts` - Scheduled Functions

Defines cron jobs for recurring tasks.

**Implementation**:
```typescript
// convex/cron.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Example: Run cleanup every hour
crons.interval(
  "cleanup-old-sessions",
  { hours: 1 },
  internal.router.admin.cleanupSessions,
);

// Example: Daily reports at midnight
crons.daily(
  "generate-daily-reports",
  { hourUTC: 0, minuteUTC: 0 },
  internal.router.reports.generateDaily,
);

// Example: Weekly backup on Sundays
crons.weekly(
  "weekly-backup",
  { dayOfWeek: "sunday", hourUTC: 2, minuteUTC: 0 },
  internal.router.admin.backupData,
);

export default crons;
```

📖 **See**: [Convex Cron Documentation](https://docs.convex.dev/scheduling/cron-jobs)