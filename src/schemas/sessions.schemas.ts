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
  rememberMe: z
    .boolean()
    .optional()
    .describe('Whether to keep the user signed in for a longer period'),
});
export const createSessionResponseSchema = sessionSchema;

/** Retrieve Session Schemas */

export const retrieveSessionResponseSchema = sessionSchema;
