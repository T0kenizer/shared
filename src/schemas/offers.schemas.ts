import { BillingInterval, Offer } from '@/types/offers.types';
import { USER_PLANS } from '@constants/plans.constants';
import { z } from 'zod';

export const offerPriceSchema = z.object({
  amount: z
    .number()
    .int()
    .describe('The price in the smallest currency unit (e.g. cents)'),
  currency: z.string().describe('The ISO 4217 currency code, lowercase'),
  interval: z
    .enum(BillingInterval)
    .nullable()
    .describe('The billing period, or null when the offer is paid once'),
});

export const offerMetadataSchema = z.object({
  offer: z.enum(Offer).describe('The offer to send to Checkout'),
  plan: z.enum(USER_PLANS).describe('The plan the offer grants'),
  price: offerPriceSchema.describe('What the offer costs'),
});

/** List Offers Schemas */

export const listOffersResponseSchema = z
  .array(offerMetadataSchema)
  .describe('The offers on sale, in the order of the catalog');
