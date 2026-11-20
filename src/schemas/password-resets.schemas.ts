import { createUserDataSchema } from '@schemas/users.schemas';
import { z } from 'zod';

/** Request Reset Schemas */

export const requestResetDataSchema = z.object({
  email: z.email().describe('The email of the account to reset'),
});

/** Apply Reset Schemas */

export const applyResetDataSchema = createUserDataSchema.pick({
  password: true,
});
