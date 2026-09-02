# PES — working notes

## Database schema changes

**Never run `prisma db push`** against the local or production database. Use
`prisma migrate dev` locally and `prisma migrate deploy` for production, so each
change leaves both a file in `prisma/migrations/` and a row in the database's
`_prisma_migrations` ledger.

This matters because it has already gone wrong. The schema declares 62 models;
the migrations create 11. The rest were pushed directly, so:

- **`prisma migrate dev` currently fails.** It replays the history into a shadow
  database, and `20260802120000_add_wellbeing_sessions` alters `StressCycle` —
  a table no migration creates (`Error: P3006`). New migrations must be
  hand-written and applied with `db execute` + `migrate resolve --applied`.
- **Two migrations are recorded in a database with no folder here**
  (`add_expires_at`, `add_locked_schedule_fields`), and one is recorded twice
  locally. No column is missing in either database — the history is what's
  incomplete.

The fix is to baseline the history into a single `0_init`; not yet done.
Full audit and the hand-apply recipe: `docs/schema-migrations.md` (untracked).

## Deploys

`jasmond/dev` is the deployed branch (Vercel). The build script is
`prisma generate && next build` — it does **not** run migrations. Apply schema
changes to production *before* pushing code that depends on them:

```bash
npx --yes dotenv-cli -e .env.production.local -- npx prisma migrate status
npx --yes dotenv-cli -e .env.production.local -- npx prisma migrate deploy
```

`origin` is the client's upstream repo (Henryho-dev); `jasmond` is ours.

## Neon and `P1001`

If a Prisma CLI command reports `P1001: Can't reach database server`, the
database is very probably fine. Prisma's default connect timeout is 5s, which
Neon's pooler regularly exceeds, and the failure is intermittent — the same
command succeeds on the next run. A plain `pg` client connects throughout.

`.env.production.local` therefore pins `connect_timeout=30` on `DATABASE_URL`.
Keep it there when the password is rotated; without it, `migrate status` and
`migrate deploy` fail unpredictably and look like an outage.

Diagnose before believing an outage: `nc -vz <host> 5432` proves reachability,
and the Neon console's Computes page shows whether the compute is SUSPENDED
(normal, Free plan scales to zero after 5 minutes of inactivity) or disabled.

## Applying SQL through the Neon console

When the CLI cannot be used, run the migration's SQL in the console — then
record it, or Prisma still counts the migration as pending and the next
`migrate deploy` re-applies it:

```sql
INSERT INTO "_prisma_migrations"
  (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (gen_random_uuid(), '<sha256 of migration.sql>', now(), '<folder name>', NULL, NULL, now(), 1);
```

The checksum is `shasum -a 256 prisma/migrations/<name>/migration.sql`, and it
must match the file exactly. `prisma migrate resolve --applied <name>` does the
same thing whenever the CLI can connect; prefer it.

One-off data fixes are not migrations. They live in `prisma/backfills/`, are
written to be safe to run twice, and are applied with `prisma db execute`.
