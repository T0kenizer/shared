import * as Constants from '@constants/users.constants';
import { z } from 'zod';
import { serializedUserSchema } from './users.schemas';

const passwordSchema = z
  .string()
  .min(Constants.PASSWORD_MIN_LENGTH)
  .max(Constants.PASSWORD_MAX_LENGTH);

export const updateProfileSchema = z.object({
  displayName: z.string().max(Constants.DISPLAY_NAME_MAX_LENGTH).nullish(),
  username: z
    .string()
    .min(Constants.USERNAME_MIN_LENGTH)
    .max(Constants.USERNAME_MAX_LENGTH)
    .regex(Constants.USERNAME_REGEX, {
      message: 'Username must only contain letters, numbers and underscores',
    })
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema.optional(),
  newPassword: passwordSchema,
});

export const confirmDeletionSchema = z.object({
  token: z.string(),
});

export const profileResponseSchema = serializedUserSchema;
