-- Per-organization, per-role access to the mathematical models.
CREATE TABLE "model_access" (
    "id" SERIAL NOT NULL,
    "org" VARCHAR(255) NOT NULL,
    "role" VARCHAR(60) NOT NULL,
    "model_key" VARCHAR(60) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_access_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "model_access_unique" ON "model_access"("org", "role", "model_key");
CREATE INDEX "model_access_org_role_idx" ON "model_access"("org", "role");
