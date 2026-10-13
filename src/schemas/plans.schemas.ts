import { GameMode } from '@/types/games.types';
import { Feature, Plan } from '@/types/plans.types';
import { z } from 'zod';

export const featureMetadataSchemas = {
  [Feature.JoinGame]: z.object({
    access: z.boolean().describe('Whether the plan can join a game'),
  }),
  [Feature.CreateGame]: z.object({
    access: z.boolean().describe('Whether the plan can create a game'),
    modes: z
      .array(z.enum(GameMode))
      .describe('The game modes the plan can create'),
    maxSeats: z.number().int().describe('The most seats a table can hold'),
  }),
};

export const planMetadataSchema = z.object(featureMetadataSchemas);

export const planPriceSchema = z.object({
  amount: z
    .number()
    .int()
    .describe('The price in the smallest currency unit (e.g. cents)'),
  currency: z.string().describe('The ISO 4217 currency code, lowercase'),
  interval: z
    .enum(['month', 'year'])
    .nullable()
    .describe('The billing period, or null when the plan is paid once'),
});

export const planSchema = z.object({
  features: planMetadataSchema.describe('What the plan grants'),
  price: planPriceSchema
    .nullable()
    .describe('What the plan costs, or null when it is not sold'),
});

/** List Plans Schemas */

export const listPlansResponseSchema = z.record(z.enum(Plan), planSchema);
