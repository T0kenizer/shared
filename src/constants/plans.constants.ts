import { PaidPlan, Plan, UserPlan } from '@/types/plans.types';

// Ordered from the lowest tier to the highest.
export const PAID_PLANS = [
  Plan.Premium,
  Plan.Founder,
] as const satisfies readonly PaidPlan[];

export const USER_PLANS = [
  Plan.Free,
  ...PAID_PLANS,
] as const satisfies readonly UserPlan[];
