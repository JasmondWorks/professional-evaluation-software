-- Per-organization exceptions to the product plan.
--
-- The plan matrix itself lives in app/lib/billing/entitlements.ts. This table
-- holds only the deviations from it: one row per key an organization has been
-- granted beyond its tier, or had taken away. Almost every organization has no
-- rows here at all.
--
-- granted = true  -> allow even though the plan does not include it
-- granted = false -> deny even though the plan does include it
CREATE TABLE "org_entitlements" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    -- A key from ENTITLEMENTS in app/lib/billing/entitlements.ts.
    "entitlement_key" VARCHAR(80) NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    -- Why this row exists: an on-demand purchase, a trial, a client agreement.
    "reason" TEXT,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_entitlements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "org_entitlements_unique" ON "org_entitlements"("org", "entitlement_key");
CREATE INDEX "org_entitlements_org_idx" ON "org_entitlements"("org");
