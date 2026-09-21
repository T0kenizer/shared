import { serializedUserSchema } from '@schemas/users.schemas';
import { z } from 'zod';

export const sessionSchema = z.object({
  user: serializedUserSchema,
  expiresAt: z.date().describe('The date and time when the session expires'),
  expiresIn: z
    .number()
    .int()
    .nonnegative()
    .describe('Milliseconds until the session expires'),
});

/** Create Session Schemas */

export const createSessionDataSchema = z.object({
  login: z.string().nonempty().describe('The username or email of the user'),
  password: z.string().nonempty().describe('The password of the user'),
  stayConnected: z
    .boolean()
    .optional()
    .describe(
      'Whether the session should roll forward with activity instead of expiring at a fixed deadline',
    ),
});
export const createSessionResponseSchema = sessionSchema;

/** Retrieve Session Schemas */

export const retrieveSessionResponseSchema = sessionSchema;
