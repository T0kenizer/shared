import { GameMode } from '@/types/games.types';
import { Feature, Plan, PlanMetadata } from '@/types/plans.types';

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
  [Plan.Premium]: {
    [Feature.JoinGame]: { access: true },
    [Feature.CreateGame]: {
      access: true,
      modes: [GameMode.Poker, GameMode.Free],
      maxSeats: 12,
    },
  },
} as const;
