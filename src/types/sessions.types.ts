import * as Schemas from '@schemas/sessions.schemas';
import { z } from 'zod';

export type SessionID = 'current' | (string & {});

export enum DeviceType {
  Desktop = 'DESKTOP',
  Mobile = 'MOBILE',
  Tablet = 'TABLET',
  Unknown = 'UNKNOWN',
}

/** Create Session Types */

export type CreateSessionData = z.infer<typeof Schemas.createSessionDataSchema>;
export type CreateSessionResponse = z.infer<
  typeof Schemas.createSessionResponseSchema
>;

/** Retrieve Session Types */

export type RetrieveSessionResponse = z.infer<
  typeof Schemas.retrieveSessionResponseSchema
>;

/** Delete Session Types */

export type DeleteSessionResponse = void;
