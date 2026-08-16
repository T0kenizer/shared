import * as Schemas from '@schemas/files.schemas';
import { z } from 'zod';

export enum FileStatus {
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Ready = 'READY',
  Failed = 'FAILED',
}

export enum FileUploadMode {
  Sync = 'sync',
  Async = 'async',
}

export type SerializedFile = z.infer<typeof Schemas.serializedFileSchema>;

/** Create File Types */

// z.input keeps `mode` optional on the client; the schema defaults it.
export type CreateFileQuery = z.input<typeof Schemas.createFileQuerySchema>;
export type CreateFileResponse = z.infer<
  typeof Schemas.createFileResponseSchema
>;

/** Retrieve File Types */

export type RetrieveFileResponse = z.infer<
  typeof Schemas.retrieveFileResponseSchema
>;
