import * as Constants from '@constants/users.constants';
import { z } from 'zod';

export const requestResetSchema = z.object({
  email: z.email(),
});

export const applyResetSchema = z
  .object({
    password: z.string().nonempty().max(Constants.PASSWORD_MAX_LENGTH),
    confirmPassword: z.string().nonempty(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
