import { z } from 'zod';

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
