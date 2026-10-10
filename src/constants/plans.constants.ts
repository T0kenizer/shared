import { GameMode } from '@/types/games.types';
import {
  Feature,
  PaidPlan,
  Plan,
  PlanMetadata,
  UserPlan,
} from '@/types/plans.types';

// Ordered from the lowest tier to the highest.
export const PAID_PLANS = [
  Plan.Premium,
  Plan.Founder,
] as const satisfies readonly PaidPlan[];

export const USER_PLANS = [
  Plan.Free,
  ...PAID_PLANS,
] as const satisfies readonly UserPlan[];

const PREMIUM_METADATA: PlanMetadata = {
  [Feature.JoinGame]: { access: true },
  [Feature.CreateGame]: {
    access: true,
    modes: [GameMode.Poker, GameMode.Free],
    maxSeats: 12,
  },
};

export const PLAN_METADATA: Record<Plan, PlanMetadata> = {
  [Plan.Anonymous]: {
    [Feature.JoinGame]: { access: true },
    [Feature.CreateGame]: {
      access: false,
      modes: [],
      maxSeats: 0,
    },
  },
  [Plan.Free]: {
    [Feature.JoinGame]: { access: true },
    [Feature.CreateGame]: {
      access: true,
      modes: [GameMode.Poker],
      maxSeats: 4,
    },
  },
  [Plan.Premium]: PREMIUM_METADATA,
  [Plan.Founder]: PREMIUM_METADATA,
} as const;
