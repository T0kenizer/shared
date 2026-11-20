import type * as Schemas from '@schemas/offers.schemas';
import type { z } from 'zod';

export enum Offer {
  PremiumMonthly = 'PREMIUM_MONTHLY',
  PremiumYearly = 'PREMIUM_YEARLY',
  FounderLifetime = 'FOUNDER_LIFETIME',
}

export enum BillingInterval {
  Month = 'month',
  Year = 'year',
}

export type OfferPrice = z.infer<typeof Schemas.offerPriceSchema>;

/** An offer on sale, as the backend catalog declares it. */
export type OfferMetadata = z.infer<typeof Schemas.offerMetadataSchema>;

/** List Offers Types */

export type ListOffersResponse = z.infer<
  typeof Schemas.listOffersResponseSchema
>;
