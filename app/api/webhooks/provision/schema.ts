/** The provisioning payload, and the contract it describes.
 *
 *  Every field the signup form used to ask for now has to arrive from the
 *  storefront, because there is no form to ask in. The messages here are
 *  written for the developer integrating against this endpoint rather than for
 *  us: a refusal should say what was expected, not "Invalid input".
 *
 *  FIELD_CONTRACT is returned with every 400, so the answer to "what fields
 *  does this need" is the error itself and cannot drift from the code that
 *  enforces it. docs/storefront-provisioning-webhook.md is the prose version of
 *  the same thing.
 */

import { z } from 'zod';
import { INSTITUTION_TYPES, PLAN_TYPES } from '@/app/lib/billing/catalog';

const CATEGORIES = INSTITUTION_TYPES.map((i) => i.toLowerCase());
const PLANS = PLAN_TYPES.map((p) => p.toLowerCase());

export const provisionSchema = z.object({
  organization_name: z
    .string({ error: 'Required. The organization being registered.' })
    .trim()
    .min(2, 'Must be at least 2 characters.')
    .max(255, 'Must be 255 characters or fewer.'),

  admin_name: z
    .string({ error: 'Required. Full name of the person who will administer PES.' })
    .trim()
    .min(2, 'Must be at least 2 characters.')
    .max(100, 'Must be 100 characters or fewer.'),

  admin_email: z
    .string({ error: 'Required. Becomes their sign-in email; the set-password link is sent here.' })
    .trim()
    .toLowerCase()
    .email('Must be a valid email address.'),

  product_category: z
    .string({ error: `Required. One of: ${CATEGORIES.join(', ')}.` })
    .trim()
    .refine((v) => CATEGORIES.includes(v.toLowerCase()), {
      message: `Must be one of: ${CATEGORIES.join(', ')}.`,
    }),

  product_plan: z
    .string({ error: `Required. One of: ${PLANS.join(', ')}.` })
    .trim()
    .refine((v) => PLANS.includes(v.toLowerCase()), {
      message: `Must be one of: ${PLANS.join(', ')}.`,
    }),

  payment_reference: z
    .string({ error: 'Required. The PayPal subscription, order or capture id.' })
    .trim()
    .min(4, 'Too short to be a PayPal id.')
    .max(255, 'Must be 255 characters or fewer.'),

  payment_kind: z
    .enum(['order', 'subscription', 'capture'], {
      error: 'Must be one of: order, subscription, capture.',
    })
    .optional(),

  // Cross-checked against PayPal, never trusted. Accepted so a mismatch can be
  // logged rather than discovered later in a reconciliation.
  amount_paid: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be whole currency units, e.g. "228.57".')
    .optional(),

  currency: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === 'USD', { message: 'Only USD is sold today.' })
    .optional(),

  paid_at: z
    .string()
    .trim()
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: 'Must be an ISO 8601 date, e.g. "2026-09-09T16:40:12Z".',
    })
    .optional(),

  admin_phone: z.string().trim().max(40, 'Must be 40 characters or fewer.').optional(),

  organization_logo_url: z
    .string()
    .trim()
    .url('Must be a URL.')
    .refine((v) => v.startsWith('https://'), { message: 'Must be https.' })
    .optional(),

  maintenance_model: z
    .boolean({ error: 'Must be true or false, not a string.' })
    .optional(),

  buyer_email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Must be a valid email address.')
    .optional(),
});

export type ProvisionInput = z.infer<typeof provisionSchema>;

/** The same contract, in a form that can be handed back in an error. */
export const FIELD_CONTRACT = {
  required: {
    organization_name: 'string, 2–255 chars. Must be globally unique in PES.',
    admin_name: 'string, 2–100 chars.',
    admin_email: 'email. Becomes the sign-in email; the set-password link goes here.',
    product_category: `one of: ${CATEGORIES.join(' | ')}`,
    product_plan: `one of: ${PLANS.join(' | ')}`,
    payment_reference: 'string. PayPal subscription, order or capture id.',
  },
  optional: {
    payment_kind: 'one of: order | subscription | capture. Saves a lookup.',
    amount_paid: 'string, whole currency units, e.g. "228.57". Cross-checked against PayPal.',
    currency: 'USD',
    paid_at: 'ISO 8601. Cross-checked against PayPal.',
    admin_phone: 'string, max 40 chars.',
    organization_logo_url: 'https URL.',
    maintenance_model: 'boolean. One-time add-on; included by default for company.',
    buyer_email: 'email. Only if the payer is not the administrator.',
  },
  headers: {
    'Content-Type': 'application/json',
    'X-Timestamp': 'unix seconds',
    'X-Signature': 'sha256=HMAC_SHA256(secret, X-Timestamp + "." + rawBody)',
    'X-Idempotency-Key': 'your own unique id for this payment',
  },
} as const;

/** Field names we accept, for spotting a typo rather than reporting the field
 *  it was meant to be as simply missing. "organisation_name" is the one this
 *  will catch most. */
export const KNOWN_FIELDS = [
  ...Object.keys(FIELD_CONTRACT.required),
  ...Object.keys(FIELD_CONTRACT.optional),
];

export function unknownFields(body: unknown): string[] {
  if (!body || typeof body !== 'object') return [];
  return Object.keys(body as Record<string, unknown>).filter((k) => !KNOWN_FIELDS.includes(k));
}
