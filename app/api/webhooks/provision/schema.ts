/** The provisioning payload. Shared by the webhook and the availability check.
 *
 *  Every field the signup form used to ask for now has to arrive from the
 *  storefront, because there is no form to ask in. See
 *  docs/storefront-provisioning-webhook.md — that document and this schema must
 *  say the same thing. */

import { z } from 'zod';

export const provisionSchema = z.object({
  organization_name: z.string().trim().min(2).max(255),
  admin_name: z.string().trim().min(2).max(100),
  admin_email: z.string().trim().toLowerCase().email(),

  // Validated against the catalogue after parsing, not here: the catalogue is
  // the only thing that knows what is actually sold.
  product_category: z.string().trim(),
  product_plan: z.string().trim(),

  payment_reference: z.string().trim().min(4).max(255),
  payment_kind: z.enum(['order', 'subscription', 'capture']).optional(),

  // Cross-checked against PayPal, never trusted. Accepted so a mismatch can be
  // logged rather than discovered months later in a reconciliation.
  amount_paid: z.string().trim().optional(),
  currency: z.string().trim().length(3).optional(),
  paid_at: z.string().trim().optional(),

  admin_phone: z.string().trim().max(40).optional(),
  organization_logo_url: z.string().trim().url().optional(),
  maintenance_model: z.boolean().optional(),
  buyer_email: z.string().trim().toLowerCase().email().optional(),
});

export type ProvisionInput = z.infer<typeof provisionSchema>;
