import { UserRole } from '@/types/users.types';
import * as Constants from '@constants/users.constants';
import { z } from 'zod';

export const userEntitySchema = z.object({
  uuid: z.uuid().describe('The unique identifier of the user'),
  username: z.string().describe('The username of the user'),
  displayName: z.string().nullish().describe('The display name of the user'),
  email: z.email().describe('The email of the user'),
  password: z.string().nullish().describe('The password of the user'),
  googleId: z.string().nullish().describe('The Google account id of the user'),
  avatarUrl: z.string().nullish().describe('The avatar URL of the user'),
  role: z.enum(UserRole).describe('The role of the user'),
  createdAt: z.date().describe('The date when the user was created'),
  updatedAt: z.date().describe('The date when the user was last updated'),
  deletedAt: z.date().nullish().describe('The date when the user was deleted'),
});

export const serializedUserSchema = userEntitySchema
  .omit({
    password: true,
    googleId: true,
  })
  .transform((user) => ({
    ...user,
    displayName: user.displayName ?? user.username,
  }));

/** Create User Schemas */

export const createUserDataSchema = z.object({
  username: z
    .string()
    .min(Constants.USERNAME_MIN_LENGTH)
    .max(Constants.USERNAME_MAX_LENGTH)
    .regex(Constants.USERNAME_REGEX, {
      message: 'Username must only contain letters, numbers and underscores',
    })
    .describe('The username of the user'),
  email: z.email().describe('The email of the user'),
  password: z
    .string()
    .nonempty()
    .max(Constants.PASSWORD_MAX_LENGTH)
    .describe('The password of the user'),
});
export const createUserResponseSchema = serializedUserSchema;
