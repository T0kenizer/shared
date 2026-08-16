import { FileStatus, FileUploadMode } from '@/types/files.types';
import { loadableRelation } from '@schemas/utils.schemas';
import { z } from 'zod';

export const fileEntitySchema = z.object({
  uuid: z.uuid().describe('The unique identifier of the file'),
  bucketKey: z.string().describe('The key of the file inside the bucket'),
  bucketName: z.string().describe('The name of the bucket storing the file'),
  originalFilename: z
    .string()
    .describe('The original filename of the uploaded file'),
  mimeType: z.string().describe('The mime type of the file'),
  sizeBytes: z.number().int().describe('The size of the file in bytes'),
  checksumSha256: z
    .string()
    .nullish()
    .describe('The sha256 checksum of the file'),
  status: z.enum(FileStatus).describe('The processing status of the file'),
  createdBy: loadableRelation(z.object({ uuid: z.uuid() }))
    .nullish()
    .describe('The uploader of the file (uuid, or the user when loaded)'),
  createdAt: z.date().describe('The date when the file was created'),
  updatedAt: z.date().describe('The date when the file was last updated'),
  deletedAt: z.date().nullish().describe('The date when the file was deleted'),
});

export const buildFileUrl = (uuid: string): string => `/files/${uuid}/content`;

/** Serialization Schemas */

// Bucket internals stay server-side; clients reach the content through `url`.
export const serializedFileSchema = fileEntitySchema
  .omit({ bucketKey: true, bucketName: true, deletedAt: true })
  .transform(({ createdBy, ...file }) => ({
    ...file,
    // A freshly created file carries the loaded uploader entity, whereas a
    // fetched one only carries its uuid; clients always get the uuid.
    createdBy:
      (typeof createdBy === 'string' ? createdBy : createdBy?.uuid) ?? null,
    url: buildFileUrl(file.uuid),
  }));

/** Create File Schemas */

export const createFileQuerySchema = z.object({
  mode: z
    .enum(FileUploadMode)
    .default(FileUploadMode.Sync)
    .describe(
      'Whether the content is stored before responding (sync) or in the background (async)',
    ),
});
export const createFileResponseSchema = serializedFileSchema;

/** Retrieve File Schemas */

export const retrieveFileResponseSchema = serializedFileSchema;
