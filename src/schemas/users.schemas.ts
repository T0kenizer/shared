import { Plan } from '@/types/plans.types';
import { UserRole } from '@/types/users.types';
import * as Constants from '@constants/users.constants';
import { fileEntitySchema } from '@schemas/files.schemas';
import { loadableRelation } from '@schemas/utils.schemas';
import { z } from 'zod';

export const userEntitySchema = z.object({
  uuid: z.uuid().describe('The unique identifier of the user'),
  username: z.string().describe('The username of the user'),
  displayName: z.string().nullish().describe('The display name of the user'),
  email: z.email().describe('The email of the user'),
  password: z.string().nullish().describe('The password of the user'),
  googleId: z.string().nullish().describe('The Google account id of the user'),
  avatar: loadableRelation(fileEntitySchema)
    .nullish()
    .describe('The avatar file of the user (uuid, or the file when loaded)'),
  role: z.enum(UserRole).describe('The role of the user'),
  plan: z
    .enum([Plan.Free, Plan.Premium])
    .describe('The subscription plan of the user'),
  createdAt: z.date().describe('The date when the user was created'),
  updatedAt: z.date().describe('The date when the user was last updated'),
  deletedAt: z.date().nullish().describe('The date when the user was deleted'),
  confirmedAt: z
    .date()
    .nullish()
    .describe('The date when the user confirmed their email address'),
});

export const serializedUserSchema = userEntitySchema
  .omit({ avatar: true, password: true, googleId: true })
  .extend({ avatarUrl: z.url().nullable() })
  .transform((user) => ({
    ...user,
    displayName: user.displayName ?? user.username,
  }));

/** User Input Schemas */

// Shared by every write endpoint so a field is only ever validated one way.
export const userInputSchema = z.object({
  username: z
    .string()
    .min(Constants.USERNAME_MIN_LENGTH)
    .max(Constants.USERNAME_MAX_LENGTH)
    .regex(Constants.USERNAME_REGEX, {
      message:
        'Username must only contain letters, numbers, dots, underscores and hyphens',
    })
    .describe('The username of the user'),
  displayName: z
    .string()
    .min(1)
    .max(Constants.DISPLAY_NAME_MAX_LENGTH)
    .describe('The display name of the user'),
  email: z
    .email()
    .max(Constants.EMAIL_MAX_LENGTH)
    .describe('The email of the user'),
  password: z
    .string()
    .min(Constants.PASSWORD_MIN_LENGTH)
    .max(Constants.PASSWORD_MAX_LENGTH)
    .describe('The password of the user'),
});

/** Create User Schemas */

export const createUserDataSchema = userInputSchema.pick({
  username: true,
  email: true,
  password: true,
});
export const createUserResponseSchema = serializedUserSchema;

/** Partial Update User Schemas */

export const partialUpdateUserDataSchema = userInputSchema
  .pick({
    displayName: true,
    email: true,
    password: true,
  })
  .extend({
    displayName: userInputSchema.shape.displayName.nullable(),
    avatar: z
      .uuid()
      .nullable()
      .describe('The uuid of the avatar file (null to remove the avatar)'),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
export const partialUpdateUserResponseSchema = serializedUserSchema;
