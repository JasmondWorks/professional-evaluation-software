// lib/utils/paypalSetup.ts

// Using global fetch (Node 18+ or Next.js)
import { packages as rawPackages } from "./packages"; 
// Assume rawPackages is your base mapping: planKey → { name, price, maybe productId?, planId? }

type PackageConfig = {
  name: string;
  price: number;  // in cents or whatever
  productId?: string;
  planId?: string;
};

export type PackagesResolved = {
  [planKey: string]: PackageConfig & { productId: string; planId: string };
};

const PAYPAL_BASE = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const resp = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const j = await resp.json();
  if (!resp.ok) throw new Error("Failed to get PayPal access token: " + JSON.stringify(j));
  return j.access_token;
}

async function createProductIfNeeded(pkg: PackageConfig): Promise<string> {
  if (pkg.productId) return pkg.productId;

  const token = await getAccessToken();
  const resp = await fetch(`${PAYPAL_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: pkg.name,
      description: `${pkg.name} subscription`,
      type: "SERVICE",
      category: "SOFTWARE",
      // you can optionally include image_url, home_url etc.
    }),
  });
  const j = await resp.json();
  if (!resp.ok) throw new Error("Error creating product: " + JSON.stringify(j));
  return j.id; // something like "PROD-XXXX"
}

async function createPlanIfNeeded(pkg: PackageConfig & { productId: string }): Promise<string> {
  if (pkg.planId) return pkg.planId;

  const token = await getAccessToken();
  const resp = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: pkg.productId,
      name: `${pkg.name} Plan`,
      description: `Subscription plan for ${pkg.name}`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,  // 0 means infinite until cancellation
          pricing_scheme: { fixed_price: { value: (pkg.price / 100).toFixed(2), currency_code: "USD" } }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: "0.00", currency_code: "USD" },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      // optionally taxes etc
    }),
  });
  const j = await resp.json();
  if (!resp.ok) throw new Error("Error creating plan: " + JSON.stringify(j));
  return j.id; // something like "P-XXXX"
}

export async function resolvePackages(): Promise<PackagesResolved> {
  const resolved: PackagesResolved = {} as any;

  for (const key of Object.keys(rawPackages) as Array<keyof typeof rawPackages>) {
    const base = rawPackages[key];
    // create product if needed
    const productId = await createProductIfNeeded(base);
    // create plan if needed (needs productId)
    const planId = await createPlanIfNeeded({ ...base, productId });
    resolved[key] = {
      ...base,
      productId,
      planId
    };
  }

  return resolved;
}
