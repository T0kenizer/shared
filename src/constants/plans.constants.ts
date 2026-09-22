import { Feature, FeatureMetadataMap, Plan } from '@/types/plans.types';

type PlanMetadata = { [F in Feature]: FeatureMetadataMap[F] };

export const PLAN_METADATA: Record<Plan, PlanMetadata> = {
  [Plan.Anonymous]: {
    [Feature.JoinGame]: { access: true },
    [Feature.CreateGame]: {
      access: false,
      canUseTemplates: false,
      canCustomize: false,
      maxSeats: 0,
    },
  },
  [Plan.Free]: {
    [Feature.JoinGame]: { access: true },
    [Feature.CreateGame]: {
      access: true,
      canUseTemplates: true,
      canCustomize: false,
      maxSeats: 4,
    },
  },
  [Plan.Premium]: {
    [Feature.JoinGame]: { access: true },
    [Feature.CreateGame]: {
      access: true,
      canUseTemplates: true,
      canCustomize: true,
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

export function canCustomizeGame(plan: Plan): boolean {
  return featureMetadata(plan, Feature.CreateGame).canCustomize;
}

export function canUseTemplates(plan: Plan): boolean {
  return featureMetadata(plan, Feature.CreateGame).canUseTemplates;
}
