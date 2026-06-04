import * as Schemas from '@schemas/password-resets.schemas';
import { z } from 'zod';

export type RequestResetData = z.infer<typeof Schemas.requestResetSchema>;
export type ApplyResetData = z.infer<typeof Schemas.applyResetSchema>;
