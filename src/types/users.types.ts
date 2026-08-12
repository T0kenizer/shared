import * as Schemas from '@schemas/users.schemas';
import { z } from 'zod';

export enum UserRole {
  User = 'USER',
  Admin = 'ADMIN',
  Owner = 'OWNER',
}

export type SerializedUser = z.infer<typeof Schemas.serializedUserSchema>;

/** Create User Types */

export type CreateUserData = z.infer<typeof Schemas.createUserDataSchema>;
export type CreateUserResponse = z.infer<
  typeof Schemas.createUserResponseSchema
>;

/** Partial Update User Types */

export type PartialUpdateUserData = z.infer<
  typeof Schemas.partialUpdateUserDataSchema
>;
export type PartialUpdateUserResponse = z.infer<
  typeof Schemas.partialUpdateUserResponseSchema
>;
