import { GameMode } from '@/types/games.types';
import {
  Feature,
  FeatureMetadataMap,
  Plan,
  PlansMetadata,
} from '@/types/plans.types';

export function featureMetadata<F extends Feature>(
  plans: PlansMetadata,
  plan: Plan,
  feature: F,
): FeatureMetadataMap[F] {
  return plans[plan][feature];
}

export function hasFeature(
  plans: PlansMetadata,
  plan: Plan,
  feature: Feature,
): boolean {
  return featureMetadata(plans, plan, feature).access;
}

export function maxSeatsFor(plans: PlansMetadata, plan: Plan): number {
  return featureMetadata(plans, plan, Feature.CreateGame).maxSeats;
}

export function gameModesFor(plans: PlansMetadata, plan: Plan): GameMode[] {
  return featureMetadata(plans, plan, Feature.CreateGame).modes;
}

export function canUseMode(
  plans: PlansMetadata,
  plan: Plan,
  mode: GameMode,
): boolean {
  return gameModesFor(plans, plan).includes(mode);
}
