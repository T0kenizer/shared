import { UserRole } from '@/types/users.types';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 64;
export const DISPLAY_NAME_MAX_LENGTH = 64;
export const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export const EMAIL_MAX_LENGTH = 320;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

/**
 * One composition requirement a password must satisfy, stated once so the
 * validation schema and the strength meter cannot drift apart: `test` is what
 * the API enforces, `label` is the checklist entry shown while typing, and
 * `message` is the error returned when the rule fails.
 */
export interface PasswordRule {
  id: string;
  label: string;
  message: string;
  test: (password: string) => boolean;
}

/**
 * Twelve characters drawn from all four categories, which is the ~80 bits of
 * entropy the CNIL (délibération n° 2022-100) requires of a password standing
 * on its own, without account lockout or any other complementary measure.
 *
 * Unicode property escapes rather than ASCII ranges: a password is accepted
 * whatever alphabet it is written in, and anything that is neither a letter nor
 * a number counts as a symbol.
 */
export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `${PASSWORD_MIN_LENGTH} characters or more`,
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'case',
    label: 'Upper and lower case letters',
    message: 'Password must contain an upper and a lower case letter',
    test: (password) => /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password),
  },
  {
    id: 'digit',
    label: 'A number',
    message: 'Password must contain a number',
    test: (password) => /\p{N}/u.test(password),
  },
  {
    id: 'symbol',
    label: 'A symbol',
    message: 'Password must contain a symbol',
    test: (password) => /[^\p{L}\p{N}]/u.test(password),
  },
];

export const GOOGLE_ID_MAX_LENGTH = 64;

export const ADMIN_ROLES: UserRole[] = [
  UserRole.Admin,
  UserRole.Owner,
] as const;
