import { UserRole } from '@/types/users.types';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 64;
export const DISPLAY_NAME_MAX_LENGTH = 64;
export const USERNAME_REGEX = /^[a-zA-Z0-9._\-']+$/;

export const EMAIL_MAX_LENGTH = 320;

export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 72;

export const GOOGLE_ID_MAX_LENGTH = 64;

export const ADMIN_ROLES: UserRole[] = [
  UserRole.Admin,
  UserRole.Owner,
] as const;
