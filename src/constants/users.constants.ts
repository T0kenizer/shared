import { UserRole } from '@/types/users.types';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 64;
export const DISPLAY_NAME_MAX_LENGTH = 64;
export const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export const EMAIL_MAX_LENGTH = 320;

export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 72;

export const GOOGLE_ID_MAX_LENGTH = 64;

export const ADMIN_ROLES: UserRole[] = [
  UserRole.Admin,
  UserRole.Owner,
] as const;

/**
 * Marker written into `game_participants.claimed_by` when the account holding a
 * seat is deleted. The column otherwise carries the claimant's identity — null
 * while the seat was never taken, a user uuid for a registered player, an
 * anonymous token for a guest — so the marker is what tells those three apart
 * from "somebody sat here and their account is gone".
 *
 * Deliberately not a uuid: nothing can ever present it, so a stamped seat can
 * never be re-entered by a new account reusing an old identifier.
 */
export const DELETED_USER_CLAIM = 'deleted_user';
