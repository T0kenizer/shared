import { GameMode } from '@/types/games.types';
import { BillingInterval, Feature, Offer, Plan } from '@/types/plans.types';
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
    .enum(BillingInterval)
    .nullable()
    .describe('The billing period, or null when the plan is paid once'),
});

export const planOfferSchema = z.object({
  offer: z.enum(Offer).describe('The offer to send to Checkout'),
  price: planPriceSchema.describe('What the offer costs'),
});

export const planSchema = z.object({
  features: planMetadataSchema.describe('What the plan grants'),
  offers: z
    .array(planOfferSchema)
    .describe('The offers the plan is sold through, empty when it is not sold'),
});

/** List Plans Schemas */

export const listPlansResponseSchema = z.record(z.enum(Plan), planSchema);
