import { Plan } from '@/types/plans.types';
import { SubscriptionStatus } from '@/types/subscriptions.types';
import { planPriceSchema } from '@schemas/plans.schemas';
import { z } from 'zod';

export const subscriptionSchema = z.object({
  plan: z
    .enum([Plan.Premium, Plan.Founder])
    .describe('The plan the subscription grants'),
  status: z.enum(SubscriptionStatus).describe('The Stripe subscription status'),
  price: planPriceSchema.describe('What the subscription renews at'),
  currentPeriodEnd: z
    .date()
    .describe('The date when the current billing period ends'),
  cancelAt: z
    .date()
    .nullable()
    .describe('The date when the subscription ends, or null when it renews'),
  createdAt: z.date().describe('The date when the subscription started'),
});

export const invoiceStatusSchema = z.enum([
  'draft',
  'open',
  'paid',
  'uncollectible',
  'void',
]);

export const invoiceSchema = z.object({
  id: z.string().describe('The Stripe invoice id'),
  number: z.string().nullable().describe('The invoice number, once finalized'),
  status: invoiceStatusSchema.describe('The Stripe invoice status'),
  amount: z
    .number()
    .int()
    .describe('The total in the smallest currency unit (e.g. cents)'),
  currency: z.string().describe('The ISO 4217 currency code, lowercase'),
  createdAt: z.date().describe('The date when the invoice was issued'),
  hostedUrl: z
    .url()
    .nullable()
    .describe('The Stripe page to view, or pay, the invoice'),
  pdfUrl: z.url().nullable().describe('The invoice PDF'),
});

export const paymentMethodSchema = z.object({
  brand: z
    .string()
    .describe('The card network, as Stripe names it (e.g. "visa")'),
  last4: z.string().length(4).describe('The last four digits of the card'),
  expMonth: z.number().int().min(1).max(12).describe('The expiry month'),
  expYear: z.number().int().describe('The expiry year, four digits'),
});

/** Retrieve Subscription Schemas */

export const retrieveSubscriptionResponseSchema = subscriptionSchema;

/** Cancel Subscription Schemas */

export const cancelSubscriptionResponseSchema = subscriptionSchema;

/** Resume Subscription Schemas */

export const resumeSubscriptionResponseSchema = subscriptionSchema;

/** List Invoices Schemas */

export const listInvoicesResponseSchema = z.array(invoiceSchema);

/** Retrieve Payment Method Schemas */

export const retrievePaymentMethodResponseSchema = paymentMethodSchema;
