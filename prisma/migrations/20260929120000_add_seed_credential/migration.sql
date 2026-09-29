-- Store /local-seed credential records in the database instead of a
-- gitignored JSON/MD file under the repo root, which does not work on a
-- deployed (Vercel) environment: the filesystem there is read-only outside
-- /tmp, and /tmp does not persist between invocations.
CREATE TABLE "seed_credential" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "org_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "plan" VARCHAR(100) NOT NULL,
    "admin_name" VARCHAR(255) NOT NULL,
    "admin_email" VARCHAR(255) NOT NULL,
    "admin_password" VARCHAR(255) NOT NULL,
    "employees" JSONB NOT NULL DEFAULT '[]',
    "seeded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seed_credential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "seed_credential_org_id_key" ON "seed_credential"("org_id");
