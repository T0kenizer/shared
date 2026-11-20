import { Plan, type UserPlan } from '@/types/plans.types';

// Ordered from the lowest tier to the highest.
export const USER_PLANS = [
  Plan.Free,
  Plan.Premium,
  Plan.Founder,
] as const satisfies readonly UserPlan[];
