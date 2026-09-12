-- Provisioning an organization from a completed storefront payment.
--
-- Hand-written and applied with `db execute` + `migrate resolve --applied`,
-- because `prisma migrate dev` cannot replay this project's history (see
-- CLAUDE.md).

-- One row per accepted provisioning call, so a retry replays the first answer
-- instead of creating a second organization.
CREATE TABLE "webhook_deliveries" (
    "id" SERIAL NOT NULL,
    "source" VARCHAR(60) NOT NULL,
    "idempotency_key" VARCHAR(255) NOT NULL,
    "payment_reference" VARCHAR(255),
    "status_code" INTEGER NOT NULL,
    "response" JSONB NOT NULL,
    "org" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webhook_deliveries_key_unique"
    ON "webhook_deliveries"("source", "idempotency_key");
CREATE INDEX "webhook_deliveries_payment_reference_idx"
    ON "webhook_deliveries"("payment_reference");

-- Hold a person at the change-password screen when the password was generated
-- for them rather than chosen by them.
ALTER TABLE "pesuser" ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pesuser" ADD COLUMN "first_login_at" TIMESTAMP(6);

-- A SHA-256 hash of the set-password / reset token, never the token itself.
ALTER TABLE "pesuser" ADD COLUMN "password_token" VARCHAR(64);
ALTER TABLE "pesuser" ADD COLUMN "password_token_expiry" TIMESTAMP(6);
ALTER TABLE "pesuser" ADD COLUMN "password_token_purpose" VARCHAR(20);

CREATE INDEX "pesuser_password_token_idx" ON "pesuser"("password_token");
