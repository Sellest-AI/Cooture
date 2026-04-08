export const CREDITS_CONFIG = {
  // Generation cost
  COST_PER_IMAGE_GENERATION: 100,
  COST_PER_VIDEO_GENERATION: 150,
  COST_PER_ITEM: 5,
  COST_PER_PRESET: 30,

  // Daily rewards
  WEEKLY_REWARDS: 120, // Total credits earned over a 7-day streak (1.2 × COST_PER_IMAGE_GENERATION)
  STREAK_DAYS: 7, // Number of days in a streak cycle

  // Timing constraints (in hours)
  MIN_HOURS_BETWEEN_CLAIMS: 20, // Must wait 20h between claims (allows once per day)
  MAX_HOURS_TO_MAINTAIN_STREAK: 48, // Missing 2 days breaks the streak

  // Initial credits for new users
  STARTING_CREDITS: 200, // Enough for 2 generations to try the app
  COOTURE_PLUS_CREDITS: 100 * 15,
} as const;

/**
 * Calculate the daily reward for a given streak day using a progressive formula
 * Supports infinite streaks by cycling through the 7-day reward pattern
 * @param streakDay - Current streak day (1, 2, 3, ..., infinite)
 * @returns The number of credits to award
 */
export function calculateDailyReward(streakDay: number): number {
  const { WEEKLY_REWARDS, STREAK_DAYS } = CREDITS_CONFIG;

  // Map streak day to the 7-day cycle (1-7)
  // Example: day 1 → 1, day 7 → 7, day 8 → 1, day 15 → 1, day 100 → 2
  const cycleDay = Math.max(0, ((streakDay - 1) % STREAK_DAYS) + 1);

  // Formula: progressive distribution that sums to WEEKLY_REWARDS
  // Uses a weighted distribution: base + (cycleDay - 1) * increment

  // Calculate base and increment to reach target
  // Sum = n * base + increment * (0 + 1 + 2 + ... + (n-1))
  // Sum = n * base + increment * (n-1) * n / 2
  // Solving for base when we know Sum and choose increment

  const totalDays = STREAK_DAYS;
  const sumOfIncrements = ((totalDays - 1) * totalDays) / 2; // 0+1+2+3+4+5+6 = 21 for 7 days

  // We want a progressive increase, let's use increment of 2.5
  // This gives: base + 0*2.5, base + 1*2.5, base + 2*2.5, ..., base + 6*2.5
  // Total = 7*base + 2.5*21 = 7*base + 52.5 = 120
  // So base = (120 - 52.5) / 7 = 9.64...

  // For clean numbers, let's calculate it properly:
  // We want it to sum exactly to WEEKLY_REWARDS
  const increment = 2.5;
  const base = (WEEKLY_REWARDS - increment * sumOfIncrements) / totalDays;

  const reward = base + (cycleDay - 1) * increment;

  // Round to nearest integer
  return Math.round(reward);
}

/**
 * Get all daily rewards for a complete streak cycle
 * @returns Array of daily rewards [day1, day2, ..., day7]
 */
export function getAllDailyRewards(): number[] {
  return Array.from({ length: CREDITS_CONFIG.STREAK_DAYS }, (_, i) =>
    calculateDailyReward(i + 1)
  );
}