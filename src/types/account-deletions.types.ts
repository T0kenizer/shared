import type * as Schemas from '@schemas/account-deletions.schemas';
import type { z } from 'zod';

/** Request Deletion Types */

export type RequestDeletionResponse = void;

/** Validate Deletion Token Types */

export type ValidateDeletionTokenResponse = z.infer<
  typeof Schemas.validateDeletionTokenResponseSchema
>;

/** Apply Deletion Types */

export type ApplyDeletionResponse = void;
