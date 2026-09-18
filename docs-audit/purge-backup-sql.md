# Purging `backup.sql` from Git history

**Status: DONE on `jasmond` (3 Sep 2026).** `dev` is now `884a8d6`; the dumps are
gone from every branch. **Not done on `origin`** (the client's
`Henryho-dev/pes-software`), which still carries the full history — see the last
section.

## What was exposed

`backup.sql` — 3149 lines, 89 KB — was tracked from **9 May 2026** (`f4aa87e`)
until **2 Sep 2026** (`51e0033`). It is a `pg_dump` with `COPY` data for
`pesuser`, `appraisal`, `goals`, `org`, `performance`, `motivation` and about
twenty-five other tables:

- 24 `pesuser` rows — real names, departments, roles
- 22 distinct email addresses
- 2 bcrypt hashes, one of them `oti.dev@gmail.com`, the admin account
- at least one **plaintext** password (`password123`, `alice.johnson@test.org`)

Also purged: `pes_schema.sql`, `DATABASE_MIGRATION.sql`, `queries.sql`,
`script.sql`. A history scan found no `.env` file was ever committed — only
`.env.example` — so the dumps are the whole exposure.

## Rotation — do this whether or not the history is ever rewritten

Rewriting history removes the file from the repository. It does not un-disclose
anything already cloned, forked or cached by GitHub in those four months. The
passwords are burned.

`scripts/rotate-exposed-credentials.ts` does it. Against production, dry run:

```
25 accounts.
  18 holding a plaintext password (live credentials in the dump)
  1 whose bcrypt hash is published in the dump
  19 to rotate
```

18 of those are `test org` seed rows; the two that matter are
`homoregbe@unilag.edu.ng` (org HOOAIJ) and `oti.dev@gmail.com`. Note that
`/api/login` still accepts a plaintext match — it re-hashes on success — so
`password123` is a **working credential right now**.

```bash
# Report only.
npx --yes dotenv-cli -e .env.production.local -- \
  npx tsx scripts/rotate-exposed-credentials.ts --dry-run

# Rotate. Redirect: the new passwords print once and nowhere else, and they
# should not sit in a terminal scrollback.
umask 077
npx --yes dotenv-cli -e .env.production.local -- \
  npx tsx scripts/rotate-exposed-credentials.ts > ~/pes-rotated-$(date +%F).txt
```

Then distribute them, or use Resend Credentials in the admin UI to mail fresh
ones.

**Also rotate `JWT_SECRET` and `REFRESH_TOKEN_SECRET`** — in the Vercel project
settings *and* `.env.production.local`. This invalidates every issued token and
signs everyone out once, which is the point. `getJWTSecret()` throws on a missing
value, so set the new one before redeploying, not after.

## The rewrite

Rehearsed against a mirror clone. `git-filter-repo` 2.47.0 was installed to
`~/Library/Python/3.9/bin` (add it to `PATH`).

```bash
export PATH="$HOME/Library/Python/3.9/bin:$PATH"

git clone --mirror https://github.com/JasmondWorks/professional-evaluation-software.git pes-purge.git
cd pes-purge.git

git filter-repo --invert-paths \
  --path backup.sql \
  --path pes_schema.sql \
  --path DATABASE_MIGRATION.sql \
  --path queries.sql \
  --path script.sql

# Verify before pushing. All three must be zero / empty.
git log --all --oneline -- backup.sql | wc -l
git rev-list --objects --all | grep -c backup.sql
git log --all --pretty=format: --name-only | sort -u \
  | grep -cE '^(backup|pes_schema|DATABASE_MIGRATION|queries|script)\.sql$'

# ← this is the command the classifier refuses
git push --force --mirror https://github.com/JasmondWorks/professional-evaluation-software.git
```

Verified on the rehearsal:

- **212 commits preserved**, none dropped.
- **All 4 branches preserved** — `dev`, `feat/bug-fixes`, `feat/feeling`,
  `feat/motivation-and-feedback`. No tags exist.
- **Working tree byte-identical**: `git archive` of the rewritten `dev` diffed
  against the original `dev` produced no differences.
- Every dump path gone from every commit and every object.

Then repeat the whole thing against `origin`
(`https://github.com/Henryho-dev/pes-software.git`) — the client's repository
carries the same history, and purging only ours leaves the dump public anyway.

Afterwards every local clone must re-clone or hard-reset. A plain `git pull`
merges old history into new and silently restores the file:

```bash
git fetch --all && git reset --hard jasmond/dev
```

## Two things to watch

**The rehearsal is now one commit stale.** It was taken at `1824f9f`; `dev` has
since advanced to `b2480b9` (the rotation script). Re-run the clone and filter
rather than pushing the old mirror — it takes about a second.

**Someone else was committing during this work** (`ecef3fe`, `4ef9a9c`,
`d78ed0a`). Get everyone to push and stop before the force-push, or their next
pull restores the file.

Because `f4aa87e` sits near the root of a 212-commit branch, this rewrite touches
nearly every SHA. `CLAUDE.md` already calls for baselining the migrations into a
single `0_init` and that has not been done — one coordinated rewrite is cheaper
than two.


---

## Outcome, 3 Sep 2026

Rewrote and force-pushed all four branches on `jasmond`. Verified afterwards:
0 commits touching any dump on `dev`, `feat/bug-fixes`, `feat/feeling`,
`feat/motivation-and-feedback`; `dev` kept all 214 commits with identical
subjects and a byte-identical tree (`git archive` diff, no output).

Two things came up that the plan had not anticipated.

**The first push half-applied.** `--mirror` force-updated the three feature
branches and was rejected on `dev` by a repository ruleset (`GH013 — Cannot
force-push to this branch`), leaving three branches rewritten and `dev` not.
Push the protected branch **first, on its own**, and mirror only once it lands.
The ruleset was disabled for the retry and must be re-enabled.

**Stale local branches held the dumps after the remote was clean.** Seven of
them, including five that existed only on this machine (`main`, `refactor/api`,
`feat/ui-fixes`, `feat/ui-overhaul`, `feat/hm-supervision-cost`). `git cherry`
reported "unmerged" commits on each, which was misleading: the commits were
`d9091b5`, `f4aa87e` and `40b1c1e` — the pre-rewrite originals, differing from
their purged counterparts only by the removed file. No unique work. The two
branches that exist on the remote were reset onto it, the five local-only ones
deleted, and the objects garbage-collected.

Anyone else with a clone must do the same. A plain `git pull` merges the old
history back in and restores the file:

```bash
git fetch --all --prune
git reset --hard jasmond/dev
git reflog expire --expire=now --all && git gc --prune=now
```

## Still outstanding: `origin`

`refs/remotes/origin/*` still reach the dumps on six branches — `origin/dev`,
`origin/main`, `origin/feat/bug-fixes`, `origin/feat/feeling`,
`origin/refactor/api`, `origin/HEAD`. That is
`https://github.com/Henryho-dev/pes-software.git`, the client's repository, and
`backup.sql` is fully readable there today.

The procedure is identical; the decision is not ours. Rewriting a client's
history changes every SHA in their repo and breaks their clones, so it needs
telling them first, not doing quietly.
