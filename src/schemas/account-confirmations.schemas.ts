import { z } from 'zod';

/** Request Confirmation Schemas */

export const requestConfirmationDataSchema = z.object({
  email: z.email().describe('The email of the account to confirm'),
});

/** Validate Confirmation Token Schemas */

export const validateConfirmationTokenResponseSchema = z.object({
  email: z.email().describe('The email of the account about to be confirmed'),
});
