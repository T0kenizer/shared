import * as Schemas from '@schemas/account-confirmations.schemas';
import { z } from 'zod';

/** Request Confirmation Types */

export type RequestConfirmationData = z.infer<
  typeof Schemas.requestConfirmationDataSchema
>;
export type RequestConfirmationResponse = void;

/** Validate Confirmation Token Types */

export type ValidateConfirmationTokenResponse = z.infer<
  typeof Schemas.validateConfirmationTokenResponseSchema
>;

/** Apply Confirmation Types */

export type ApplyConfirmationResponse = void;
