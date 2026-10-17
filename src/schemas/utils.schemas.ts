import { SortOrder } from '@/types';
import { z } from 'zod';

type ListQueryConfig = {
  defaultLimit: number;
  maxLimit: number;
};

const paginatedQuerySchema = (config: ListQueryConfig) =>
  z.object({
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .default(0)
      .describe('The number of items to skip'),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(config.maxLimit)
      .default(config.defaultLimit)
      .describe('The maximum number of items to return'),
  });

const sortedQuerySchema = <const S extends readonly [string, ...string[]]>(
  sortFields: S,
  config: ListQueryConfig,
) =>
  paginatedQuerySchema(config).extend({
    sort: z.enum(sortFields).optional().describe('The field to sort on'),
    order: z.enum(SortOrder).default(SortOrder.Asc).describe('The sort order'),
  });

/**
 * Builds the query schema of a list endpoint. Without sort fields, the list is
 * only paginated and accepts neither `sort` nor `order`.
 */
export function listQuerySchema(
  sortFields: readonly [],
  config: ListQueryConfig,
): ReturnType<typeof paginatedQuerySchema>;
export function listQuerySchema<const S extends readonly [string, ...string[]]>(
  sortFields: S,
  config: ListQueryConfig,
): ReturnType<typeof sortedQuerySchema<S>>;
export function listQuerySchema(
  sortFields: readonly string[],
  config: ListQueryConfig,
) {
  return sortFields.length === 0
    ? paginatedQuerySchema(config)
    : sortedQuerySchema(sortFields as [string, ...string[]], config);
}

export const listResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema).describe('The items of the requested page'),
    total: z
      .number()
      .int()
      .nonnegative()
      .describe('The number of items matching the query, across all pages'),
  });

/**
 * Builds the schema of a loadable relation: either the uuid of the related
 * entity, or the entity itself once loaded.
 *
 * ORM references wrap the entity behind an accessor rather than exposing its
 * fields, so they are unwrapped before validation; a reference that is not
 * loaded yields its uuid.
 */
export const loadableRelation = <T extends z.ZodTypeAny>(entitySchema: T) =>
  z.preprocess(
    (value) =>
      value &&
      typeof value === 'object' &&
      'unwrap' in value &&
      typeof value.unwrap === 'function'
        ? (value as { unwrap: () => unknown }).unwrap()
        : value,
    z.union([z.uuid(), entitySchema]),
  );
