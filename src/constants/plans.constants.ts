import { GameMode } from '@/types/games.types';
import { Feature, FeatureMetadataMap, Plan } from '@/types/plans.types';

type PlanMetadata = { [F in Feature]: FeatureMetadataMap[F] };

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
      // The free table is the paid half of the offer — and buying it is
      // buying the right to configure it, because that is all the mode is.
      modes: [GameMode.Poker, GameMode.Free],
      maxSeats: 12,
    },
  },
};

export function featureMetadata<F extends Feature>(
  plan: Plan,
  feature: F,
): FeatureMetadataMap[F] {
  return PLAN_METADATA[plan][feature];
}

export function hasFeature(plan: Plan, feature: Feature): boolean {
  return featureMetadata(plan, feature).access;
}

export function maxSeatsFor(plan: Plan): number {
  return featureMetadata(plan, Feature.CreateGame).maxSeats;
}

/** The modes this plan may open a table in. */
export function gameModesFor(plan: Plan): GameMode[] {
  return featureMetadata(plan, Feature.CreateGame).modes;
}

export function canUseMode(plan: Plan, mode: GameMode): boolean {
  return gameModesFor(plan).includes(mode);
}
