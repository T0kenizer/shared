import * as Schemas from '@schemas/subscriptions.schemas';
import { z } from 'zod';

export enum SubscriptionStatus {
  Active = 'active',
  Trialing = 'trialing',
  PastDue = 'past_due',
  Unpaid = 'unpaid',
  Paused = 'paused',
  Canceled = 'canceled',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
}

export enum CheckoutStatus {
  Success = 'success',
  Cancelled = 'cancelled',
}

export enum CheckoutError {
  Unauthenticated = 'unauthenticated',
  Failed = 'failed',
}

export type Subscription = z.infer<typeof Schemas.subscriptionSchema>;

export type InvoiceStatus = z.infer<typeof Schemas.invoiceStatusSchema>;

export type Invoice = z.infer<typeof Schemas.invoiceSchema>;

export type PaymentMethod = z.infer<typeof Schemas.paymentMethodSchema>;

/** Retrieve Subscription Types */

export type RetrieveSubscriptionResponse = z.infer<
  typeof Schemas.retrieveSubscriptionResponseSchema
>;

/** Cancel Subscription Types */

export type CancelSubscriptionResponse = z.infer<
  typeof Schemas.cancelSubscriptionResponseSchema
>;

/** Resume Subscription Types */

export type ResumeSubscriptionResponse = z.infer<
  typeof Schemas.resumeSubscriptionResponseSchema
>;

/** List Invoices Types */

export type ListInvoicesQuery = z.infer<typeof Schemas.listInvoicesQuerySchema>;
export type ListInvoicesResponse = z.infer<
  typeof Schemas.listInvoicesResponseSchema
>;

/** Retrieve Payment Method Types */

export type RetrievePaymentMethodResponse = z.infer<
  typeof Schemas.retrievePaymentMethodResponseSchema
>;
