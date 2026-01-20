import { cronJobs } from "convex/server";
// import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval(
//   "clear tasks",
//   { minutes: 1 }, // every minute
//   internal.messages.clearAll,
// );

export default crons;