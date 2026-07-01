import * as Schemas from '@schemas/password-resets.schemas';
import { z } from 'zod';

/** Request Reset Types */

export type RequestResetData = z.infer<typeof Schemas.requestResetDataSchema>;
export type RequestResetResponse = void;

/** Validate Token Types */

export type ValidateTokenResponse = void;

/** Apply Reset Types */

export type ApplyResetData = z.infer<typeof Schemas.applyResetDataSchema>;
export type ApplyResetResponse = void;
