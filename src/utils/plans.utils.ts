import { GameMode } from '@/types/games.types';
import { Feature, FeatureMetadataMap, Plan } from '@/types/plans.types';
import { PLAN_METADATA } from '@constants/plans.constants';

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

export function gameModesFor(plan: Plan): GameMode[] {
  return featureMetadata(plan, Feature.CreateGame).modes;
}

export function canUseMode(plan: Plan, mode: GameMode): boolean {
  return gameModesFor(plan).includes(mode);
}
