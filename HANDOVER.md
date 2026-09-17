# Security audit — handover

**2–4 September 2026.** Rewrite of the API authorization layer, purge of a
committed database dump, and rotation of the credentials it exposed. Read this
before touching `app/api/`, and read [AGENTS.md](AGENTS.md) §"API route security
constraints" before writing a route handler.

Commits: `d730be7` → `ce07416` on `dev`.

---

## 1. What was wrong

The API had no authorization layer. Of 199 route handlers, **59 asked the caller
for nothing at all**, and many that did asked wrongly. Four distinct faults, in
descending severity:

**Forgeable refresh tokens.** `REFRESH_TOKEN_SECRET` was read as
`process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-change-in-production'`.
The variable was set nowhere — not in the deployment, not in `.env.example` —
so every refresh cookie in production was signed with a key printed in this
repository. Forge `{userID}`, present it to `/api/refresh`, receive a valid
access token as that user. No password needed. The `httpOnly; Secure;
SameSite=strict` cookie was irrelevant, because the signature was public.

**Unauthenticated writes and reads across tenants.** `/api/admin/users-by-org`
returned every user in every organization *including the bcrypt password column*,
to anyone. `/api/admin/users/[id]` accepted an unauthenticated `DELETE` by id.
`/api/resendCredentials` overwrote any account's password from its email address
alone. `/api/paystack/upgrade` cancelled any subscription by address.
`appraisal`, `counterAppraisal`, `getStress`, `counterStress` had no `org` clause
at all.

**Scoping by attacker-controlled values.** Thirteen routes derived `org` from
`jwtDecode()`, which parses a token without verifying its signature. This is the
subtle one: the code *looks* correct — it scopes by org — it just scopes by an
org the caller chose. Three of these were "fixed" in a commit literally titled
*"scope … to org to prevent data leakage"* and remained fully readable across
tenants afterwards.

**A committed database dump.** `backup.sql` — 3149 lines — was tracked from
9 May to 2 Sep on two GitHub remotes. `COPY` data for `pesuser` and ~25 other
tables: 24 staff rows, 22 email addresses, 2 bcrypt hashes, and **18 passwords
in plain text**. `/api/login` accepted plaintext matches, so those were working
credentials for four months.

### Why it happened

46 of the 59 unguarded routes arrived in the client's original commit
(`d9091b5`, 9 May, 40,746 lines), where nothing checked anything. Routes written
later copied the shape of their neighbours — which is normally the right
instinct, and is exactly wrong for authorization. There was no shared guard to
copy until `app/api/_lib/authGuard.ts` existed. That is the failure mode
[AGENTS.md](AGENTS.md) now names explicitly.

---

## 2. What was done

**Authorization.** Every handler establishes identity before its first query.
`authorize(tokenFromRequest(req), rule)` from
[`app/api/_lib/authGuard.ts`](app/api/_lib/authGuard.ts); `consoleViewer()` from
[`app/api/admin/_scope.ts`](app/api/admin/_scope.ts) for the platform console,
which separates `super-admin` (all organizations) from `admin` (one). The org is
taken from the verified token and never from the request. Routes that are public
on purpose — 4 auth endpoints, 4 provider webhooks, 2 survey forms, downloads —
say so in a comment, which is what the audit greps key off.

**Secrets.** `getJWTSecret()` and `getRefreshSecret()` in
[`app/lib/jwt.ts`](app/lib/jwt.ts) throw on a missing or placeholder value. All
12 inline `|| 'fallback…'` sites now route through them. `/api/admin/login` no
longer signs with the literal `'oti'`.

**Also:** `$queryRawUnsafe` 45+ → 1 (a fixed string, commented); rate limiting on
the credential and mail routes; Zod on the model writes; path containment on
`/api/downloads/[filename]`; plaintext passwords re-hashed on successful login;
`Change Password` added to the sidebar (the page existed, nothing linked to it);
`runMigration`, `debugGoals`, `swagger`, `api-doc`, `staff-survey-send`,
`hod-assign`, `evaluate`, `pModel` deleted.

**The dump.** Purged from `jasmond` history with `git-filter-repo` and
force-pushed; 214 commits preserved with a byte-identical tree. All 19 exposed
production passwords rotated via
[`scripts/rotate-exposed-credentials.ts`](scripts/rotate-exposed-credentials.ts).
`JWT_SECRET` rotated and `REFRESH_TOKEN_SECRET` set on Vercel.

**Verified in production** (`https://professional-evaluation-software.vercel.app`):
`/api/admin/users-by-org`, `/api/orgs`, `/api/getStressData` → `401`; `/api-doc`
→ `404`; wrong-password login → `401` not `500`; 12 rapid logins → `429` from the
7th.

---

## 3. Outstanding

### The client's repository still has the dump

`origin` is `https://github.com/Henryho-dev/pes-software.git`. It carries the
same history on six branches, and `backup.sql` is readable there today.

**The passwords in it are dead** — all rotated — so what remains exposed is 24
names, 22 email addresses, departments and roles. PII, not credentials. That is
why this was left rather than done: rewriting a client's history changes every
SHA and breaks their clones, which is their decision to make.

The procedure is in [`docs-audit/purge-backup-sql.md`](docs-audit/purge-backup-sql.md)
and takes about ten minutes. Tell them the credentials are already rotated so they can
judge the urgency themselves.

### Smaller

- **No `super-admin` account exists.** `/admin/organizations` and `/admin/auditor`
  stay empty until someone runs `scripts/promote-super-admin.ts <email>`. Note
  `super-admin` (platform) and `admin` (organization) are different tiers —
  see `app/components/utils/roles.ts`.
- **Rate limiting counts per process.** On Vercel each serverless instance keeps
  its own tally, so a burst spread across instances gets more attempts than the
  configured limit. Documented at the top of `app/api/_lib/rateLimit.ts`; move it
  to Redis when there is somewhere shared to put it.
- **Zod covers 18 of 199 routes.** The credential and model-write routes are
  done; the rest is unfinished, not broken.
- `app/utils/auth.ts` doc comments say "localStorage"; `TokenManager` is
  in-memory. The admin console login does use `localStorage`, unlike the main app.

### Inherited, untouched, and a landmine

**`prisma migrate dev` does not work.** The schema declares 62 models; the
migrations create 11. The rest were applied with `prisma db push`, so the history
cannot be replayed into a shadow database (`P3006` on
`20260802120000_add_wellbeing_sessions`, which alters a table no migration
creates). New migrations must be hand-written and applied with `db execute` +
`migrate resolve --applied`.

This predates the audit and was not touched. The fix is to baseline into a single
`0_init`. **The history rewrite has already changed every SHA, so this is an
unusually cheap moment to do it** — the disruption that normally makes people
defer it has just been paid for. Full detail in [CLAUDE.md](CLAUDE.md);
`npm run db:push` now refuses and explains why.

---

## 4. Operational notes

- **`~/pes-rotated-<date>.txt`** on the developer's machine holds the 19 rotated
  production passwords. It is the only copy — the script prints once and stores
  nothing. Move it into a password manager or re-run the rotation.
- **`backup.sql` is still in the working directory**, untracked and ignored. It
  cannot be re-committed, but it is the original leak; move it off the machine.
- **Force-push protection on `dev` was disabled** to land the purge. Confirm it
  is back on.
- **The detailed working record is in [`docs-audit/`](docs-audit/)** — the full
  finding-by-finding audit and the purge log. It lives there rather than in
  `docs/`, which is gitignored, so it survives a fresh clone. The migration audit
  (`docs/schema-migrations.md`) is still untracked on the developer's machine.

## 5. Before writing another route

```bash
# Handlers with no identity check. Match the call, not the bare word:
# `authorize` also matches `authorizedBy`, and that false pass once hid an
# unguarded route through a full audit.
grep -rLE 'authorize\(|verifyToken\(|tokenFromRequest\(|viewerFrom\(|consoleViewer\(|jwt.verify\(|Deliberately public' \
  app/api --include=route.ts

grep -rn 'jwtDecode(\|jwt\.decode(' app/api          # unverified token, server side
grep -rn 'body\.org\|params\.org' app/api            # attacker-supplied scoping
```

All three should stay empty, or the exception should be justified in the commit
message. Do not copy a neighbouring route to decide whether a guard is needed.
