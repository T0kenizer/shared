import type * as Schemas from '@schemas/plans.schemas';
import type { z } from 'zod';

export enum Plan {
  Anonymous = 'ANONYMOUS',
  Free = 'FREE',
  Premium = 'PREMIUM',
  Founder = 'FOUNDER',
}

/** A plan that can be stored on a user. */
export type UserPlan = Exclude<Plan, Plan.Anonymous>;

export enum Feature {
  JoinGame = 'JOIN_GAME',
  CreateGame = 'CREATE_GAME',
}

export type FeatureMetadataMap = z.infer<typeof Schemas.planMetadataSchema>;

export type PlanMetadata = { [F in Feature]: FeatureMetadataMap[F] };

/** The features of every plan, as the backend declares them. */
export type PlansMetadata = Record<Plan, PlanMetadata>;

/** List Plans Types */

export type ListPlansResponse = z.infer<typeof Schemas.listPlansResponseSchema>;
