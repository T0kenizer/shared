import { z } from 'zod';

/** Validate Deletion Token Schemas */

export const validateDeletionTokenResponseSchema = z.object({
  email: z.email().describe('The email of the account about to be deleted'),
});
