# AGENTS.md — Working conventions for this project

Guidance for AI agents (and humans) contributing to the PES (Professional
Evaluation Software) codebase. Keep this file short and additive.

## UI / UX constraints

> **Design system:** this project follows a single design language — see
> [DESIGN.md](DESIGN.md) for the tokens, shared components (`app/components/ui/`),
> and patterns to use for any new or changed UI. The running record of the design
> overhaul (what changed and why) lives in [UI_OVERHAUL.md](UI_OVERHAUL.md); when you
> make further UI changes, append a dated entry there, and update DESIGN.md if you
> add or change a token, component, or pattern.

### Disabled controls must always explain themselves
A button (or any control) that is disabled MUST tell the user **why**, right next
to it — never leave a bare greyed-out control with no context. Use one of:

- an **info icon** with a tooltip/title, and/or
- a short **message card** or inline helper line beside/under the control
  stating the reason and, ideally, what to do to enable it.

This applies especially where the reason is non-obvious (a workflow gate, a
missing prerequisite, a permission, an empty queue). Examples in this repo:
- "Run ANOVA & Generate Report" — blocked until a setting is computed, theme/
  feeling data is collected, and all submissions are approved (shows the reason).
- "Approve entire division" — when nothing is awaiting approval, show a card
  saying so rather than a silent disabled button.

Rule of thumb: **if a user could reasonably ask "why can't I click this?", the
answer must already be on the screen.**

### Nothing may look machine-generated
Everything a client or user reads (UI copy, docs, specs, reports, artifacts) must
read as though a person wrote it. Avoid the tells:

- **Em dashes.** Use a comma, colon, full stop, or rewrite the sentence.
- **Emphasis sprayed everywhere.** If half a paragraph is bold, nothing is
  emphasised. Reserve bold for the rare word that genuinely carries the sentence,
  and let headings, tables and structure do the rest.
- **Contrastive filler:** "not just X, but Y", "it isn't A, it's B".
- **Triadic padding:** "precise, restrained and immaculate" where one word works.
- **Empty intensifiers:** "critically", "notably", "seamlessly", "robust",
  "leverage", "delve", "comprehensive".
- **Openers that restate the heading** before saying anything new.
- **Emoji as section markers**, and decorative numbering (01 / 02 / 03) on things
  that are not an actual sequence. Numbering is fine when order carries meaning.

Same rule in visual design. Avoid the current generated-design cluster: warm
cream grounds with a serif display and terracotta accent, near-black with one
acid-green pop, purple-to-blue gradient heroes, Inter or Space Grotesk chosen by
default, `rounded-lg` on everything, accent bars on rounded cards, and centred
everything. Make deliberate choices instead, and follow [DESIGN.md](DESIGN.md).

Write from the reader's side of the screen: name things as people recognise them,
use active voice, and say what happened plainly.

### Every page has a title (and an optional subtitle)
Every page MUST show a clear **title** at the top so the user always knows where
they are, and an **optional subtitle** only when a short line of context helps
(what the page is for / what to do). Match the established pattern (see
`app/(admin)/models/page.tsx`): a bold `h1` title, and a muted subtitle beneath
it when useful. Don't add a subtitle just to fill space — omit it if the title
already says everything.

## Project stage: pre-launch

**This application has not launched. There are no real customers and no
production data.** The Vercel "production" deployment and the Neon database it
points at are a demo environment the client tests in. Everything in them is
seed or test data.

So do not stop to ask permission for the things that would normally need it.
Proceed and report what you did:

- **Run migrations on any database, including Neon.** Destructive statements
  (`TRUNCATE`, `DROP COLUMN`, `DROP TABLE`) are fine. Still check the live state
  first and use `prisma migrate resolve --applied` where a migration's effect
  already exists, because re-running it wastes time and can fail the queue.
- **Deploy.** Commit, merge into `dev`, push. `dev` is the production branch.
- **Change the schema** whenever the model requires it, and write the migration.
- **Delete superseded code, routes and pages** once something replaces them.
  Leaving two implementations of the same feature reachable is worse than
  removing the old one.
- **Reset or reseed data** to get a flow into a testable state.

Judgement still applies to a few things, so ask before:

- rotating or replacing secrets and API keys,
- deleting the Neon project, the Vercel project, or a git branch someone else
  is working on,
- removing the client's own uploaded documents from the repo,
- force-pushing over anyone else's commits.

**Revisit this section the moment a real organization onboards.** From then on
the deployed database holds other people's staff records, and the caution above
becomes mandatory again rather than optional.

## Data / correctness constraints

- **Organization isolation:** every query is scoped by `org`. No data may leak
  between organizations. Staff counts/listings must be identical for all users
  of the same org and consistent across every page (single source of truth =
  the `pesuser` roster, org-scoped).
- **Stress evaluation:** never mix cycles — scope Form 5 data to the effective
  settings cycle. Faculty stress = mean of its departments; organization stress
  = mean of its faculties. See project memory `stress-eval-rules`.
- **Database queries:** NEVER use raw SQL queries (`$queryRaw`, `$queryRawUnsafe`, or `$executeRaw`) unless absolutely necessary (e.g., for DDL schema migrations like `ALTER TABLE`). Always leverage the power of the Prisma ORM methods (like `findMany`, `create`, `updateMany`) for all CRUD operations to ensure type-safety, relationship cascades, and automatic protection against SQL injection.
