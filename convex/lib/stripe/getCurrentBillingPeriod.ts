export function getCurrentBillingPeriod(startDate: Date, currentDate: Date) {
  if (currentDate < startDate) return startDate;

  // Clone start date to avoid mutating original
  const base = new Date(startDate);

  let monthsPassed = 0;
  let billingStartCandidate = new Date(base);

  // Increment months until we find a billing start that's after the current date
  while (billingStartCandidate <= currentDate) {
    monthsPassed++;
    billingStartCandidate = new Date(base);
    billingStartCandidate.setMonth(base.getMonth() + monthsPassed);
  }

  // The current billing period is the previous one
  const currentBillingStart = new Date(base);
  currentBillingStart.setMonth(base.getMonth() + monthsPassed - 1);

  return currentBillingStart;
}