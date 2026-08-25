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
