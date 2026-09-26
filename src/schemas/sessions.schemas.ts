import { DeviceType } from '@/types/sessions.types';
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
  stayConnected: z
    .boolean()
    .optional()
    .describe(
      'Whether the session should roll forward with activity instead of expiring at a fixed deadline',
    ),
});
export const createSessionResponseSchema = sessionSchema;

/** Retrieve Session Schemas */

export const retrieveSessionResponseSchema = sessionSchema;

/** List User Sessions Schemas */

export const userSessionSchema = z.object({
  id: z
    .string()
    .describe('An opaque identifier of the session, stable across requests'),
  current: z
    .boolean()
    .describe('Whether this is the session the request was made with'),
  createdAt: z.date().describe('The date and time when the session was opened'),
  lastSeenAt: z
    .date()
    .describe('The date and time of the last request made with the session'),
  expiresAt: z
    .date()
    .nullable()
    .describe('The date and time when the session expires'),
  ip: z
    .string()
    .nullable()
    .describe('The IP address of the last request made with the session'),
  device: z.object({
    type: z.enum(DeviceType).describe('The kind of device'),
    os: z.string().nullable().describe('The operating system, with version'),
    browser: z.string().nullable().describe('The browser, with version'),
  }),
  location: z
    .object({
      city: z.string().nullable().describe('The city'),
      region: z.string().nullable().describe('The region or state'),
      country: z
        .string()
        .length(2)
        .nullable()
        .describe('The ISO 3166-1 alpha-2 country code'),
    })
    .nullable()
    .describe('The approximate location of the last request, when known'),
});

export const listUserSessionsResponseSchema = z
  .array(userSessionSchema)
  .describe('The active sessions of the user, most recently active first');
