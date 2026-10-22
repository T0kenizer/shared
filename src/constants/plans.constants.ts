import { Plan, type UserPlan } from '@/types/plans.types';

// Ordered from the lowest tier to the highest.
export const USER_PLANS = [
  Plan.Free,
  Plan.Premium,
  Plan.Founder,
] as const satisfies readonly UserPlan[];

/** The rank of every plan, the highest winning when several apply. */
export const PLAN_TIERS: Record<Plan, number> = {
  [Plan.Anonymous]: 0,
  [Plan.Free]: 1,
  [Plan.Premium]: 2,
  [Plan.Founder]: 3,
};
