import * as Schemas from '@schemas/user-deletions.schemas';
import { z } from 'zod';

/** Request Deletion Types */

export type RequestDeletionResponse = void;

/** Validate Deletion Token Types */

export type ValidateDeletionTokenResponse = z.infer<
  typeof Schemas.validateDeletionTokenResponseSchema
>;

/** Apply Deletion Types */

export type ApplyDeletionResponse = void;
