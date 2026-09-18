# Appraisal target templates

A plan for making the shipped target values a locked standard, letting an
organization define its own, and making the one in force visible.

Nothing here is built yet.

## Glossary

**Target** — the annual output an appraisee is expected to reach in a category.
`RTP = (ΣObserved − ΣTarget) / ΣTarget × 100`, so a target is the denominator of
every grade the system awards.

**Template** — a complete named set of targets for one model. Either the system
standard PES ships, or one an organization defines for its own use.

**System template** — shipped by PES, identical for every organization, not
editable by anyone using the product.

**Custom template** — created by an organization admin, owned by that
organization, invisible to every other organization.

**In force** — the one template a period's scoring actually used.

**Ready** — a template that is complete and frozen, so it can be selected. The
opposite of a draft. Nothing about this word means shared: a custom template
belongs to one organization and no other organization can see it. Cross-tenant
sharing is not proposed and would contradict the org-isolation rule everything
else in PES follows.

---

## 1. Where the numbers come from today

Two different sources, and they do not carry the same authority.

**Academic targets** are in `ACADEMIC_TARGETS` and `ADMINISTRATIVE_POST_TARGETS`
in [instrument.ts](instrument.ts), transcribed from the specification, pages
22 to 24. The document heads that table:

> An example of an annual targets for academic staff work output

That word is why the editor exists. `TargetEditor.tsx` says so in its own
comment: *"Editable because the source scheme is described as an example, and
because an institution may set its own."*

**Non-academic targets** are in `NON_ACADEMIC_TARGETS`, seventeen grades from 110
to 599. These are **not** in the specification at all. They came from the client's
own answers document, as a full table with cadre bands and role examples:

| Cadre group | Grades | Targets |
| --- | --- | --- |
| Support services | 1–4 | 110, 165, 192, 221 |
| Clerical and technical | 5–7 | 230, 241, 251 |
| Professional and officer | 8–10 | 265, 275, 280 |
| Management | 11–13 | 290, 300, 310 |
| Executive | 14–17 | 320, 354, 445, 599 |

That is presented as the scheme, not as an example.

## 2. How a value reaches the screen

1. Estab./Personnel opens a period.
2. `openPeriod()` calls `seedTargets(org, periodId)`, which copies every constant
   from `instrument.ts` into `appraisal_target` rows for **that period**.
3. `TargetEditor` lists those rows and `setTarget()` updates them. It is
   `requireOrgAdmin`, so only the organization admin can, but it accepts any
   value.
4. Scoring reads the rows, not the constants.

## 3. Does the client's request make sense?

Yes, and it resolves the contradiction rather than creating one.

"Example" in the specification does not mean "each administrator should retype
these". It means the figures are illustrative of a scheme an institution adopts
or replaces wholesale. What is wrong today is not that the numbers can change —
it is that they can change **one cell at a time, silently, with no record of what
the standard was and no way back**.

Three concrete problems with the current design:

**No provenance.** After an edit, nothing distinguishes a value the client
specified from one an administrator typed. A grade cannot be defended.

**No recovery.** The constants are only read at `openPeriod`. Once a period's
rows are edited there is no "restore the standard".

**Per-period drift.** Every new period re-seeds from the constants, so last
year's customisation silently disappears and this year starts from the standard
again. Two periods in the same organization can be scored against different
targets with nothing recording it.

So the client is right that the standard should be locked, and right that an
organization needs a way to define its own. Those are the same feature.

## 4. The shape

```ts
type TemplateScope = 'academic' | 'non_academic';

interface AppraisalTemplate {
  id: string;
  scope: TemplateScope;
  name: string;              // "PES standard 2026", "Unilag scheme"
  org: string | null;        // null = system template, visible to everyone
  isSystem: boolean;         // system templates are immutable, full stop
  status: 'draft' | 'ready' | 'archived';
  sourceTemplateId: string | null;  // what it was duplicated from
  createdBy: string | null;
  createdAt: Date;
  readyAt: Date | null;   // frozen at this point; targets stop being editable
}

interface AppraisalTemplateTarget {
  templateId: string;
  // Exactly one of these, matching appraisal_target today.
  position: string | null;   // academic rank
  post: string | null;       // administrative post
  cadre: string | null;      // non-academic grade
  category: string | null;   // null for the non-academic combined target
  target: number;
}
```

Two more pieces:

- **`org_template_choice(org, scope, template_id)`** — which template this
  organization uses for each scope. One row per organization per scope.
- **`appraisal_period.template_id`** — the template a period was opened against,
  written at `openPeriod`. Past periods must not change when a template is later
  edited, and today nothing records which numbers a closed period used.

### Why scope, not institution type

An academic institution needs **both**: academic staff on the academic scheme and
its own non-academic staff on the grade scheme. A company or public body needs
only the non-academic scope. So templates are scoped by model, and the
institution type decides which scopes are offered — the same distinction already
drawn for roles in `roleAllowedForCategory`.

## 5. Rules

**System templates are immutable.** Not "editable by super-admins", not
"editable with a warning". `setTarget` refuses when the target belongs to a
system template, on the server, and the UI shows read-only cells with a
"Duplicate to edit" action rather than disabled inputs nobody can explain.

**Editing means duplicating.** Pressing edit on a system template offers to
create a custom copy, pre-filled, owned by the organization. This is the only way
a custom template comes into existence, so every custom template starts from a
known-good full set and no cell can be missing.

**A template is marked ready, not merely saved.** A draft can be edited freely
and cannot be selected. Marking it ready checks it covers every position, post or
grade its scope requires, then freezes it. Only a ready template can be put in
force.

The two states exist because a target set is forty-odd cells and it is the
denominator of every grade PES awards. A half-filled set must not be selectable,
and once a period has been scored against one, the numbers must not move.

**A period is bound at open.** `openPeriod` records the template and copies its
values into `appraisal_target` exactly as it does now, so scoring is unchanged
and a closed period keeps the numbers it was scored against forever.

**Changing template mid-period is refused.** The selection applies to the next
period. A target that moves under a half-finished appraisal invalidates every
score already recorded.

**Which one is in force is always on screen.** The appraisal page shows "Scored
against: PES standard 2026" with a link, and the target screen shows it as a
badge. The client asked for this explicitly.

## 6. Retrofit

The migration must be a no-op for existing data. Nobody's scores may move.

1. **Seed the system templates** from the existing constants: one academic
   ("PES standard, academic"), one non-academic ("PES standard, non-academic").
   `instrument.ts` stays as the source, so there is still one place the shipped
   numbers live.

2. **Classify every existing organization.** For each org and scope, compare its
   current `appraisal_target` rows against the system values.
   - Identical → point `org_template_choice` at the system template.
   - Any difference → create a ready custom template named "Custom scheme
     (migrated)" from **its current values**, and select that.

   This is the important step. An organization that edited its targets keeps
   exactly what it had, now labelled honestly, rather than being silently reset
   to the standard.

3. **Backfill `appraisal_period.template_id`** for existing periods from the same
   comparison, so history reads correctly.

4. **Repoint `seedTargets`** to copy from the selected template rather than from
   the constants. Signature and output are otherwise unchanged, so scoring, the
   walkthrough and the redaction rules are untouched.

5. **Gate `setTarget`.** Refuse when the row belongs to a period bound to a system
   template, with a message naming the action: *"These are the PES standard
   targets. Duplicate them to a custom scheme to change them."*

6. **Screens.** A template list under the appraisal settings: system templates
   first, then the organization's own, each with scope, status and a Use button.
   `TargetEditor` becomes read-only when the template in force is a system one,
   and keeps its current behaviour when editing a draft custom template.

## 7. Both models, one mechanism

The scope field is what makes this work for all three institution types:

| Institution | Scopes offered | Default in force |
| --- | --- | --- |
| Academic | academic and non_academic | both PES standards |
| Company | non_academic | PES standard, non-academic |
| Public | non_academic | PES standard, non-academic |

Nothing in the mechanism is academic-specific. The company and public appraisal
gets the same lock, the same duplicate-to-edit, and the same visible statement of
what it is being scored against.

## 8. Open questions for the client

**May a custom template be edited after it is marked ready, or only superseded by
a new version?** Superseding is safer and gives a real history, but it is more
clicks.

**Who may create one?** Organization admin only, matching `setTarget` today, or
should Estab./Personnel be able to as well?

**Should PES ship more than one system template per scope?** The cadre bands in
the non-academic table suggest sector variants are plausible later.

**Does a custom template need a second pair of eyes before it can be put in
force?** A target set decides everybody's grade, so an accidental one is
expensive.

## 9. What this does not change

Scoring, the worth table, the tolerance band, the reconciliation flow, the
questionnaires and the forms are all untouched. This is entirely about where the
denominator comes from and who is allowed to change it.
