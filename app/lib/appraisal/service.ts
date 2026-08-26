// Appraisal service — the server-side orchestration between the pure scoring in
// ./scoring.ts and the database. SERVER ONLY: this module imports the worth
// table, so it must never be pulled into a client component.
//
// CONFIDENTIALITY CONTRACT (client-confirmed, 2026-08-07)
//   - The worth table must stay unknown to EVERY user, the organization admin
//     included.
//   - The tolerance band must stay unknown to staff and HODs. A flag surfaces
//     only to the organization admin.
//
// Two consequences drive the design here, because the obvious implementation
// breaks both rules. See docs/appraisal-confidentiality.md for the full write-up.
//
//   1. observed = quantity x worth. Anyone who sees both quantity and observed
//      recovers worth by division. `redactEntry` therefore strips quantity,
//      worth and observed from everything leaving the server, for every role.
//
//   2. Forms 11 and 12 are self-entered, and worth is a STEP function. An
//      appraisee who can resubmit and watch their own result move can binary
//      search the band edges and reconstruct the whole table in a few dozen
//      attempts. `assertEntryOpen` allows one submission and results stay
//      sealed until the period closes.

import prisma from '@/app/api/prisma.dev';
import { scopesForCategory, templateInForce, type TemplateScope } from './templates';
import { IntegrityReport, IntegritySubject, runIntegrityTest } from '@/app/lib/integrity';
import {
  ALL_FORMS,
  modelFor,
  staffTypeForRole,
  formsFor,
  AppraisalModel,
  AppraisalPeriodFrequency,
  CategoryKey,
  FormKey,
  MIN_STUDENT_EVALUATIONS,
  ORG_ADMIN_ROLES,
  DEPARTMENT_ADMIN_ROLES,
  DEPARTMENT_SCOPED_ROLES,
  NON_ACADEMIC_FORMS,
  questionnaireFor,
  stageOf,
  PositionKey,
} from './instrument';
import {
  categoryQuantity,
  formQuality,
  quantityOf,
  QuantityInput,
  reconcile,
  scoreAcademic,
  scoreNonAcademic,
  studentEvaluationQuality,
  studentQuantity,
} from './scoring';

export type Viewer = {
  org: string;
  name: string;
  role: string;
  dept?: string | null;
  /** academic | company | public — the org's product category, from the token. */
  productCategory?: string | null;
};

// Both lists live in ./instrument so the server and the screens can never
// disagree about who may enter what. See DEPARTMENT_ADMIN_ROLES there for the
// open question on whether the departmental administrator is the HOD.

// ---------------------------------------------------------------------------
// Periods
// ---------------------------------------------------------------------------

/** Open an appraisal period. Only Estab./Personnel may do this, and only one
 *  period may be open per org at a time so entries can never straddle two. */
export async function openPeriod(
  viewer: Viewer,
  input: { frequency: AppraisalPeriodFrequency; startsOn: Date; endsOn: Date },
) {
  requireOrgAdmin(viewer);

  const existing = await prisma.appraisal_period.findFirst({
    where: { org: viewer.org, status: 'open' },
  });
  if (existing) {
    throw new AppraisalError(
      'An appraisal period is already open. Close it before opening another.',
      409,
    );
  }
  if (input.endsOn <= input.startsOn) {
    throw new AppraisalError('The period must end after it starts.', 400);
  }

  // Which schemes this organization runs. An institution of learning has both,
  // since it employs academic and non-academic staff; a company or public body
  // has only the grade scheme.
  const scopes = scopesForCategory(viewer.productCategory);
  const bound: Partial<Record<TemplateScope, string>> = {};
  for (const scope of scopes) {
    bound[scope] = (await templateInForce(viewer.org, scope)).id;
  }

  const period = await prisma.appraisal_period.create({
    data: {
      org: viewer.org,
      frequency: input.frequency,
      starts_on: input.startsOn,
      ends_on: input.endsOn,
      opened_by: viewer.name,
      // Recorded so a closed period keeps the numbers it was scored against,
      // even after the organization later chooses a different template.
      academic_template_id: bound.academic ?? null,
      non_academic_template_id: bound.non_academic ?? null,
    },
  });

  await seedTargets(viewer.org, period.id, bound);
  return period;
}

export async function currentPeriod(org: string) {
  return prisma.appraisal_period.findFirst({
    where: { org, status: 'open' },
    orderBy: { starts_on: 'desc' },
  });
}

/** Close a period. Results only become visible to staff at this point — see the
 *  binary-search note at the top of this file. */
export async function closePeriod(viewer: Viewer, periodId: number) {
  requireOrgAdmin(viewer);
  return prisma.appraisal_period.updateMany({
    where: { id: periodId, org: viewer.org, status: 'open' },
    data: { status: 'closed' },
  });
}

/** Release results. Separate from closing, and restricted to the organization
 *  admin: closing ends data entry, releasing is when staff finally see a grade. */
export async function releaseResults(viewer: Viewer, periodId: number) {
  requireOrgAdmin(viewer);
  const period = await prisma.appraisal_period.findFirst({
    where: { id: periodId, org: viewer.org },
  });
  if (!period) throw new AppraisalError('Period not found.', 404);
  if (period.status !== 'closed') {
    throw new AppraisalError('Close the period before releasing results.', 409);
  }
  if (period.released_at) throw new AppraisalError('Results are already released.', 409);

  return prisma.appraisal_period.update({
    where: { id: periodId },
    data: { released_at: new Date(), released_by: viewer.name },
  });
}

/** Everyone being appraised in a period, with just enough to drive a list.
 *  Grades stay hidden from staff and heads until results are released. */
export async function listEntries(viewer: Viewer, periodId: number) {
  const isAdmin = ORG_ADMIN_ROLES.includes(viewer.role);
  // Includes the departmental administrator, who records Forms 8 and 9 for the
  // whole department and so must be able to see it.
  const isHead = DEPARTMENT_SCOPED_ROLES.includes(viewer.role);

  const entries = await prisma.appraisal_entry.findMany({
    where: {
      org: viewer.org,
      period_id: periodId,
      // A head sees their own department. Everyone else sees only themselves.
      ...(isAdmin ? {} : isHead ? { dept: viewer.dept } : { pesuser_name: viewer.name }),
    },
    include: { categories: { select: { category: true, quality: true } } },
    orderBy: { pesuser_name: 'asc' },
  });

  const period = await prisma.appraisal_period.findUnique({ where: { id: periodId } });
  const released = !!period?.released_at;

  return entries.map((e) => {
    const shaped: any = redactFlag(redactEntry(e), viewer);
    // Staff and heads see a grade only once results are released.
    const maySeeGrade = isAdmin || released;
    return {
      ...shaped,
      rtp: maySeeGrade ? shaped.rtp : null,
      grade: maySeeGrade ? shaped.grade : null,
      categories: e.categories.map((c) => ({ category: c.category, quality: c.quality })),
      formsCompleted: e.categories.length,
      submitted_at: e.submitted_at,
    };
  });
}

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

/** Copy the templates in force into this period's targets.
 *
 *  Scoring still reads appraisal_target exactly as before, so nothing
 *  downstream changes. What changed is where the numbers come from: the
 *  template the organization chose, rather than the constants in instrument.ts.
 *  Copying rather than referencing is deliberate — a closed period must keep the
 *  numbers it was scored against for good. */
async function seedTargets(
  org: string,
  periodId: number,
  templateIds: Partial<Record<TemplateScope, string>>,
) {
  const rows: any[] = [];

  for (const [scope, templateId] of Object.entries(templateIds)) {
    if (!templateId) continue;
    const targets = await prisma.appraisal_template_target.findMany({
      where: { template_id: templateId },
    });
    for (const t of targets) {
      rows.push({
        org,
        period_id: periodId,
        model: scope,
        position: t.position,
        post: t.post,
        cadre: t.cadre,
        category: t.category,
        target: t.target,
      });
    }
  }

  if (rows.length) await prisma.appraisal_target.createMany({ data: rows, skipDuplicates: true });
}

/** Targets are no longer edited on the period.
 *
 *  They are copied in from the template the organization has in force, so
 *  editing a cell here would put a number on screen that no template accounts
 *  for, with no record of what the standard was. The client asked on 26 August
 *  2026 that the shipped values be locked and that changing them mean creating a
 *  custom template.
 *
 *  Kept as a function so the old endpoint answers with an explanation rather
 *  than a 404.
 */
export async function setTarget(
  viewer: Viewer,
  _input: {
    periodId: number;
    model: AppraisalModel;
    position?: string;
    post?: string;
    cadre?: string;
    category?: CategoryKey;
    target: number;
  },
) {
  requireOrgAdmin(viewer);
  throw new AppraisalError(
    'Targets come from the template this organization has in force and cannot be edited here. ' +
      'To use different figures, duplicate a template on the Appraisal templates screen, ' +
      'change it there, have a second person approve it, and put it in force.',
    409,
  );
}

async function targetsFor(org: string, periodId: number, model: AppraisalModel) {
  return prisma.appraisal_target.findMany({ where: { org, period_id: periodId, model } });
}

// ---------------------------------------------------------------------------
// Entries and data capture
// ---------------------------------------------------------------------------

/** Refuse an entry that sits in the wrong appraisal for its staff member.
 *
 *  Guarding only entry creation would leave any already-created mismatch
 *  reachable forever, which is how an academic lecturer kept a non-academic
 *  appraisal open. */
export function assertModelMatches(
  entry: { model: string; pesuser_name: string | null },
  expected: AppraisalModel,
) {
  if (entry.model === expected) return;
  throw new AppraisalError(
    expected === 'academic'
      ? `${entry.pesuser_name ?? 'This staff member'} is academic staff, so this non-academic appraisal does not apply to them.`
      : `${entry.pesuser_name ?? 'This staff member'} is non-academic staff, so this academic appraisal does not apply to them.`,
    403,
  );
}

/** The appraisal model a named staff member belongs in. Exported so routes that
 *  load an entry directly can check it too. */
export async function expectedModelFor(viewer: Viewer, pesuserName: string) {
  return modelForStaff(viewer, pesuserName);
}

/** The appraisal a named staff member belongs in, read from their own record.
 *
 *  Company and public-sector organizations have no academic appraisal at all, so
 *  the product category settles it there. Inside an academic organization the
 *  post decides: only the industrial/production engineer is non-academic staff. */
async function modelForStaff(viewer: Viewer, pesuserName: string): Promise<AppraisalModel> {
  const staff = await prisma.pesuser.findFirst({
    where: { org: viewer.org, name: pesuserName },
    select: { role: true, category: true },
  });
  if (!staff) {
    throw new AppraisalError(`${pesuserName} is not on this organization's staff list.`, 404);
  }

  const productCategory = String(
    viewer.productCategory ?? staff.category ?? '',
  ).toLowerCase();

  return modelFor(productCategory, staffTypeForRole(staff.role));
}

export async function ensureEntry(
  viewer: Viewer,
  input: {
    pesuserName: string;
    model: AppraisalModel;
    position?: string;
    post?: string;
    cadre?: string;
    dept?: string;
  },
) {
  const period = await currentPeriod(viewer.org);
  if (!period) throw new AppraisalError('No appraisal period is open.', 409);

  // The model is decided by the appraisee's own post, never by the request.
  // It used to be taken straight from the body, so an academic staff member
  // could open the non-academic appraisal simply by asking for it.
  const model = await modelForStaff(viewer, input.pesuserName);

  const existing = await prisma.appraisal_entry.findFirst({
    where: { period_id: period.id, pesuser_name: input.pesuserName },
  });
  if (existing) {
    // An entry created before the model was derived server-side can be in the
    // wrong appraisal entirely. Returning it would keep that door open for as
    // long as the row survives, so refuse it rather than serve it.
    assertModelMatches(existing, model);
    return existing;
  }

  if (input.model && input.model !== model) {
    throw new AppraisalError(
      model === 'academic'
        ? 'This staff member is academic staff and belongs in the academic appraisal.'
        : 'This staff member is non-academic staff and belongs in the non-academic appraisal.',
      403,
    );
  }

  return prisma.appraisal_entry.create({
    data: {
      org: viewer.org,
      dept: input.dept ?? viewer.dept ?? null,
      period_id: period.id,
      pesuser_name: input.pesuserName,
      model,
      position: input.position ?? null,
      post: input.post ?? null,
      cadre: input.cadre ?? null,
    },
  });
}

/** An entry accepts edits only while it is a draft. Once submitted it is sealed.
 *  This is what stops the binary-search reconstruction of the worth table: a
 *  single submission gives one observation, not a probe. */
function assertEntryOpen(entry: { status: string }) {
  if (entry.status !== 'draft') {
    throw new AppraisalError(
      'This appraisal has been submitted and can no longer be edited.',
      409,
    );
  }
}

/** Who is allowed to enter which form. Confirmed: the departmental admin enters
 *  the student evaluation AND the external/peer scores; the appraisee enters
 *  research, administration and community. */
/** Who may enter which form.
 *
 *  The organization admin enters NOTHING. The client was explicit on 11 Aug:
 *  "the organisation admin or estab has no business inputting any data for any
 *  model", their role being to set goals, open a model for data capture, run the
 *  evaluation, and print and release results. Admin used to pass both branches
 *  here, which let them fill in anyone's forms. */
function assertMayEnter(viewer: Viewer, entry: { pesuser_name: string }, category: FormKey) {
  const form = ALL_FORMS.find((f) => f.key === category);
  if (!form) throw new AppraisalError(`Unknown category ${category}`, 400);

  if (ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError(
      'The organization administrator does not enter appraisal data. Open the period, then run and release the evaluation once departments have submitted.',
      403,
    );
  }

  if (form.enteredBy === 'department_admin') {
    if (!DEPARTMENT_ADMIN_ROLES.includes(viewer.role)) {
      throw new AppraisalError(
        `${form.label} is recorded by the departmental administrator, not by the appraisee.`,
        403,
      );
    }
    return;
  }

  if (viewer.name !== entry.pesuser_name) {
    throw new AppraisalError('You can only enter your own appraisal forms.', 403);
  }
}

/** Record one category's quality score. `lineItems` are the per-row scores for
 *  Forms 8, 9 and 10; Forms 11 and 12 pass a single direct score. */
/** Refuse any line item above the maximum printed beside it.
 *
 *  The UI clamps as you type, but the UI can be bypassed by posting straight to
 *  the API, and the client specifically asked that the maxima cannot be
 *  exceeded. Applies to every scored form in both models, academic and
 *  non-academic alike, since all of them carry per-item maxima. */
function assertWithinMaxima(formKey: FormKey, scores: number[]) {
  const form = ALL_FORMS.find((f) => f.key === formKey);
  if (!form || form.directScore) {
    // Forms 11 and 12 hold a single score out of 100.
    const raw = Number(scores[0] ?? 0);
    if (raw > 100 || raw < 0) {
      throw new AppraisalError('The quality score must be between 0 and 100.', 400);
    }
    return;
  }

  form.items.forEach((item, i) => {
    const raw = Number(scores[i] ?? 0);
    if (!Number.isFinite(raw)) return;
    if (raw < 0) {
      throw new AppraisalError(`"${item.label}" cannot be negative.`, 400);
    }
    if (raw > item.max) {
      throw new AppraisalError(
        `"${item.label}" is scored out of ${item.max}, but ${raw} was entered.`,
        400,
      );
    }
  });
}

export async function recordCategoryScore(
  viewer: Viewer,
  input: {
    entryId: number;
    category: FormKey;
    lineItems: number[];
    /** Student evaluation only: one array per completed copy. */
    copies?: number[][];
    studentCount?: number;
    basicUnits?: number;
    evidence?: (QuantityInput & { evidenceUrl?: string })[];
  },
) {
  const entry = await loadEntry(viewer, input.entryId);
  assertEntryOpen(entry);
  assertMayEnter(viewer, entry, input.category);

  let quality: number;
  let copiesSubmitted: number | null = null;

  if (input.category === 'student_evaluation') {
    const copies = input.copies ?? [];
    for (const copy of copies) assertWithinMaxima(input.category, copy);
    const result = studentEvaluationQuality(copies, input.studentCount ?? 0);
    if (!result.sufficient || result.quality === null) {
      throw new AppraisalError(
        `This course needs ${result.required} completed student evaluation forms before it can be scored. ${copies.length} received so far.`,
        400,
      );
    }
    quality = result.quality;
    copiesSubmitted = copies.length;
  } else {
    // formQuality() clamps when it computes, so an over-max entry never inflated
    // a score. It did persist and display though, so Form 10's nine cells could
    // read as more than the 100 they are scored out of. Refuse it instead.
    assertWithinMaxima(input.category, input.lineItems);
    quality = formQuality(input.category, input.lineItems);
  }

  const quantity =
    input.category === 'student_evaluation'
      ? studentQuantity(input.basicUnits ?? 0, input.studentCount ?? 0)
      : categoryQuantity(input.evidence ?? []);

  // quality and quantity are persisted; worth and observed are computed at
  // evaluation time and never returned to a caller.
  const existing = await prisma.appraisal_category_score.findFirst({
    where: { entry_id: entry.id, category: input.category },
  });
  const data = {
    entry_id: entry.id,
    category: input.category,
    line_items: (input.copies ?? input.lineItems) as any,
    quality,
    quantity,
    appraisal_score: quality,
    copies_submitted: copiesSubmitted,
    student_count: input.studentCount ?? null,
    basic_units: input.basicUnits ?? null,
  };

  const saved = existing
    ? await prisma.appraisal_category_score.update({ where: { id: existing.id }, data })
    : await prisma.appraisal_category_score.create({ data });

  // Replace this category's evidence with what was submitted.
  await prisma.appraisal_evidence.deleteMany({
    where: { entry_id: entry.id, category: input.category },
  });
  if (input.evidence?.length) {
    await prisma.appraisal_evidence.createMany({
      data: input.evidence.map((e) => ({
        entry_id: entry.id,
        category: input.category,
        rule_key: e.ruleKey,
        measure: e.measure,
        scripts: e.scripts ?? null,
        evidence_url: e.evidenceUrl ?? null,
        units: quantityOf(e),
      })),
    });
  }

  return redactCategory(saved);
}

/** Lock an entry for HOD review. After this the appraisee cannot edit. */
export async function submitEntry(viewer: Viewer, entryId: number) {
  const entry = await loadEntry(viewer, entryId);
  assertEntryOpen(entry);

  const scored = await prisma.appraisal_category_score.count({ where: { entry_id: entry.id } });
  if (scored === 0) throw new AppraisalError('Nothing has been scored yet.', 400);

  return prisma.appraisal_entry.update({
    where: { id: entry.id },
    data: { status: 'submitted', submitted_at: new Date() },
  });
}

/** The departmental administrator confirms Forms 8 and 9 match the paper
 *  originals before the HOD reviews anything.
 *
 *  Page 21 of the full document: entries "will be [VERIFIED] w.r.t. FORM 8, and
 *  FORM 9 by the none-academic staff in-charge of the software in the
 *  department. The H.O.D/DEAN still needs to [APPROVE/SUBMIT] all entries." */
export async function verifyEntry(
  viewer: Viewer,
  input: { entryId: number; note?: string },
) {
  if (!DEPARTMENT_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError(
      'Only the departmental administrator verifies appraisal entries.',
      403,
    );
  }
  const entry = await loadEntry(viewer, input.entryId);
  if (entry.dept && viewer.dept && entry.dept !== viewer.dept) {
    throw new AppraisalError('That appraisal belongs to another department.', 403);
  }
  if (entry.status !== 'submitted') {
    throw new AppraisalError(
      entry.status === 'draft'
        ? 'This appraisal has not been submitted yet.'
        : 'This appraisal has already been verified.',
      409,
    );
  }

  return prisma.appraisal_entry.update({
    where: { id: entry.id },
    data: {
      status: 'verified',
      verified_at: new Date(),
      verified_by: viewer.name,
      verification_note: input.note ?? null,
    },
  });
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

/** Compute an entry's result. Worth and observed are written to the row so a
 *  historic result stays reproducible, but redactEntry strips them on the way
 *  out. */
export async function evaluateEntry(viewer: Viewer, entryId: number) {
  requireOrgAdmin(viewer);
  const entry = await loadEntry(viewer, entryId);

  const scores = await prisma.appraisal_category_score.findMany({ where: { entry_id: entry.id } });
  const targets = await targetsFor(viewer.org, entry.period_id, entry.model as AppraisalModel);

  // Both models now follow the same method. They differ only in how the target
  // is looked up: academic sums four category targets, non-academic uses one
  // total target for the staff member's grade.
  const forms = scores.map((s) => ({
    form: s.category as FormKey,
    quality: Number(s.recorded_score ?? s.quality ?? 0),
    quantity: Number(s.quantity ?? 0),
  }));

  if (entry.model === 'non_academic') {
    const row = targets.find((t) => t.cadre === entry.cadre);
    const outcome = scoreNonAcademic({
      grade: entry.cadre ?? '',
      forms,
      target: row ? Number(row.target) : undefined,
    });
    return persistOutcome(entry.id, {
      totalObserved: outcome.totalObserved,
      totalTarget: outcome.totalTarget,
      rtp: outcome.rtp,
      partial: outcome.partialTarget,
      grade: outcome.grade,
    });
  }

  // Configured targets override the documented defaults.
  const targetOverrides: Record<string, number | null> = {};
  for (const t of targets) {
    if (!t.category) continue;
    const applies = t.category === 'administration' ? t.post === entry.post : t.position === entry.position;
    if (applies) targetOverrides[t.category] = Number(t.target);
  }

  const outcome = scoreAcademic({
    position: entry.position as PositionKey,
    administrativePost: entry.post ?? undefined,
    forms,
    targetOverrides,
  });

  // Store each category's observed output for reproducibility. Worth is now a
  // per-form value, so it is recomputed rather than stored per category.
  for (const c of outcome.categories) {
    const row = scores.find((s) => {
      const def = ALL_FORMS.find((d) => d.key === s.category);
      return def?.category === c.key;
    });
    if (row) {
      await prisma.appraisal_category_score.update({
        where: { id: row.id },
        data: { observed: c.observed, target: c.target },
      });
    }
  }

  return persistOutcome(entry.id, {
    totalObserved: outcome.totalObserved,
    totalTarget: outcome.totalTarget,
    rtp: outcome.rtp,
    partial: outcome.partialTarget,
    grade: outcome.grade,
  });
}

async function persistOutcome(
  entryId: number,
  o: { totalObserved: number; totalTarget: number; rtp: number | null; partial: boolean; grade?: string | null },
) {
  const { gradeOf } = await import('./scoring');
  const grade = o.grade ?? (o.rtp === null ? null : gradeOf(o.rtp));
  const updated = await prisma.appraisal_entry.update({
    where: { id: entryId },
    data: {
      total_observed: o.totalObserved,
      total_target: o.totalTarget,
      rtp: o.rtp,
      grade,
      partial_target: o.partial,
      updated_at: new Date(),
    },
  });
  return redactEntry(updated);
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------

/** The HOD records their own score with a mandatory justification. */
export async function recordHodScore(
  viewer: Viewer,
  input: { entryId: number; category: FormKey; hodScore: number; justification: string },
) {
  if (!input.justification?.trim()) {
    throw new AppraisalError('A written justification is required before a score can be changed.', 400);
  }
  const entry = await loadEntry(viewer, input.entryId);
  if (entry.status === 'draft' || entry.status === 'submitted') {
    throw new AppraisalError(
      'The departmental administrator has not verified this appraisal yet.',
      409,
    );
  }
  const row = await prisma.appraisal_category_score.findFirst({
    where: { entry_id: entry.id, category: input.category },
  });
  if (!row) throw new AppraisalError('That category has not been scored yet.', 404);

  const decision = reconcile({
    model: entry.model as AppraisalModel,
    appraisalScore: Number(row.appraisal_score ?? row.quality ?? 0),
    hodScore: input.hodScore,
    hodJustified: true,
  });

  // In-band cases settle immediately. Out-of-band cases go to the appraisee.
  // NOTE: the appraisee is prompted either way, so that being asked carries no
  // information about where the band sits. See the confidentiality write-up.
  const settled = 'store' in decision && decision.store;

  await prisma.appraisal_category_score.update({
    where: { id: row.id },
    data: {
      hod_score: input.hodScore,
      hod_justification: input.justification,
      reconciliation: settled ? decision.outcome : 'awaiting_staff_response',
      recorded_score: settled ? decision.recorded : null,
    },
  });

  await prisma.appraisal_entry.update({
    where: { id: entry.id },
    data: { status: 'awaiting_staff' },
  });

  // The HOD is told only that the score was recorded, never whether it landed
  // inside the band.
  return { recorded: true };
}

/** The appraisee accepts or contests the HOD's adjustment. */
export async function respondToHod(
  viewer: Viewer,
  input: { entryId: number; category: FormKey; accepted: boolean },
) {
  const entry = await loadEntry(viewer, input.entryId);
  if (viewer.name !== entry.pesuser_name) {
    throw new AppraisalError('Only the appraisee can respond to their own review.', 403);
  }
  const row = await prisma.appraisal_category_score.findFirst({
    where: { entry_id: entry.id, category: input.category },
  });
  if (!row || row.hod_score === null) throw new AppraisalError('There is nothing to respond to.', 404);

  const decision = reconcile({
    model: entry.model as AppraisalModel,
    appraisalScore: Number(row.appraisal_score ?? 0),
    hodScore: Number(row.hod_score),
    hodJustified: true,
    staffAccepted: input.accepted,
  });
  if (!('store' in decision)) throw new AppraisalError('That review is not ready for a response.', 409);

  await prisma.appraisal_category_score.update({
    where: { id: row.id },
    data: {
      staff_accepted: input.accepted,
      reconciliation: decision.outcome,
      // "do not store" means the figure is held out of the results until the
      // auditor rules, not that it is discarded.
      recorded_score: decision.store ? decision.recorded : null,
    },
  });

  if (decision.flag) {
    await prisma.appraisal_entry.update({
      where: { id: entry.id },
      data: { status: 'referred_to_auditor', flagged: true },
    });
  }

  // The appraisee learns the outcome of their own choice, never the band.
  return { outcome: decision.flag ? 'referred' : 'settled' };
}

/** The external auditor's figure is final. */
export async function recordAuditorScore(
  viewer: Viewer,
  input: { entryId: number; category: FormKey; score: number; note?: string },
) {
  if (viewer.role !== 'auditor' && !ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError('Only the appraisal auditor can resolve a referred score.', 403);
  }
  const entry = await loadEntry(viewer, input.entryId);
  const row = await prisma.appraisal_category_score.findFirst({
    where: { entry_id: entry.id, category: input.category },
  });
  if (!row) throw new AppraisalError('That category has not been scored yet.', 404);

  await prisma.appraisal_category_score.update({
    where: { id: row.id },
    data: { auditor_score: input.score, auditor_note: input.note, recorded_score: input.score },
  });

  const outstanding = await prisma.appraisal_category_score.count({
    where: { entry_id: entry.id, reconciliation: 'referred_to_auditor', auditor_score: null },
  });
  if (outstanding === 0) {
    await prisma.appraisal_entry.update({
      where: { id: entry.id },
      data: { status: 'hod_reviewed', flagged: false },
    });
  }
  return { resolved: outstanding === 0 };
}

// ---------------------------------------------------------------------------
// Redaction — the confidentiality boundary
// ---------------------------------------------------------------------------

/** Strip everything from which the worth table could be reconstructed.
 *
 *  observed = quantity x worth, so releasing any two of the three gives the
 *  third. Rather than trying to decide per role which pair is safe (there is no
 *  safe pair), all three are withheld from every caller. Nothing in the product
 *  needs to read raw units. */
export function redactCategory<T extends Record<string, any>>(row: T) {
  const { worth, observed, quantity, ...rest } = row as any;
  return rest;
}

/** The entry-level equivalent. total_observed is withheld for the same reason:
 *  with a known target it yields the aggregate multiplier. RTP and grade are the
 *  intended output and are safe to release. */
export function redactEntry<T extends Record<string, any>>(entry: T) {
  const { total_observed, ...rest } = entry as any;
  return rest;
}

/** Only the organization admin may see that a score was flagged. */
export function redactFlag<T extends Record<string, any>>(entry: T, viewer: Viewer) {
  if (ORG_ADMIN_ROLES.includes(viewer.role)) return entry;
  const { flagged, ...rest } = entry as any;
  return rest;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

export class AppraisalError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function requireOrgAdmin(viewer: Viewer) {
  if (!ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError('This action is restricted to the organization admin.', 403);
  }
}

async function loadEntry(viewer: Viewer, entryId: number) {
  const entry = await prisma.appraisal_entry.findFirst({
    where: { id: entryId, org: viewer.org },
  });
  if (!entry) throw new AppraisalError('Appraisal not found.', 404);
  return entry;
}

export { MIN_STUDENT_EVALUATIONS, questionnaireFor };

// ---------------------------------------------------------------------------
// Forms 2 and 4: the course and indicator registries
// ---------------------------------------------------------------------------

export async function listCourses(viewer: Viewer, periodId: number) {
  return prisma.appraisal_course.findMany({
    where: { org: viewer.org, period_id: periodId },
    orderBy: { code: 'asc' },
  });
}

/** Staff register the courses they teach. The client corrected this on 11 Aug:
 *  "it is not the Admin who is to register the courses but the staff
 *  themselves", which also follows from the admin entering no data at all. */
export async function addCourse(
  viewer: Viewer,
  input: { periodId: number; title: string; code: string; unit: number; dept?: string },
) {
  if (ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError(
      'Courses are registered by the staff who teach them, not by the organization administrator.',
      403,
    );
  }
  if (!input.title?.trim() || !input.code?.trim()) {
    throw new AppraisalError('A course needs both a title and a code.', 400);
  }
  if (!(input.unit > 0)) throw new AppraisalError('Course units must be greater than zero.', 400);

  const existing = await prisma.appraisal_course.findFirst({
    where: { org: viewer.org, period_id: input.periodId, code: input.code.trim() },
  });
  if (existing) throw new AppraisalError(`Course ${input.code} is already registered.`, 409);

  return prisma.appraisal_course.create({
    data: {
      org: viewer.org,
      period_id: input.periodId,
      dept: input.dept ?? viewer.dept ?? null,
      title: input.title.trim(),
      code: input.code.trim(),
      unit: input.unit,
    },
  });
}

export async function removeCourse(viewer: Viewer, courseId: number) {
  if (ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError(
      'Courses are managed by the staff who teach them.',
      403,
    );
  }
  return prisma.appraisal_course.deleteMany({ where: { id: courseId, org: viewer.org } });
}

export async function listIndicators(viewer: Viewer, periodId: number, pesuserName: string) {
  return prisma.appraisal_indicator.findMany({
    where: { org: viewer.org, period_id: periodId, pesuser_name: pesuserName },
    orderBy: { category: 'asc' },
  });
}

/** Form 4: tick which indicators apply to a staff member. Replaces the whole set
 *  so the screen can send its current state without diffing. */
export async function setIndicators(
  viewer: Viewer,
  input: {
    periodId: number;
    pesuserName: string;
    indicators: { category: string; label: string; courseId?: number }[];
  },
) {
  await prisma.appraisal_indicator.deleteMany({
    where: { org: viewer.org, period_id: input.periodId, pesuser_name: input.pesuserName },
  });
  if (input.indicators.length === 0) return [];
  await prisma.appraisal_indicator.createMany({
    data: input.indicators.map((i) => ({
      org: viewer.org,
      period_id: input.periodId,
      pesuser_name: input.pesuserName,
      category: i.category,
      label: i.label,
      course_id: i.courseId ?? null,
    })),
  });
  return listIndicators(viewer, input.periodId, input.pesuserName);
}

// ---------------------------------------------------------------------------
// The non-academic questionnaire
// ---------------------------------------------------------------------------


export async function saveQuestionnaire(
  viewer: Viewer,
  input: { entryId: number; answers: Record<string, { answer?: boolean | null; note?: string }> },
) {
  const entry = await loadEntry(viewer, input.entryId);
  if (viewer.name !== entry.pesuser_name && !ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError('You can only complete your own questionnaire.', 403);
  }
  assertEntryOpen(entry);

  return prisma.appraisal_entry.update({
    where: { id: entry.id },
    data: { questionnaire: input.answers as any },
  });
}

// ---------------------------------------------------------------------------
// Submission tracking and Dean approval
// ---------------------------------------------------------------------------

/** Who has not yet submitted. The model requires an HOD to see this for their
 *  department, and Estab./Personnel to see which departments are outstanding. */
export async function outstandingSubmissions(viewer: Viewer, periodId: number) {
  const isAdmin = ORG_ADMIN_ROLES.includes(viewer.role);

  // A Dean or Division head oversees a faculty, which is several departments,
  // so scoping them to a single `dept` would show almost nothing.
  let scope: any = { dept: viewer.dept };
  if (isAdmin) {
    scope = {};
  } else if (viewer.role === 'unit-head') {
    const me = await prisma.pesuser.findFirst({
      where: { org: viewer.org, name: viewer.name },
      select: { faculty_college: true },
    });
    const peers = await prisma.pesuser.findMany({
      where: { org: viewer.org, faculty_college: me?.faculty_college ?? undefined },
      select: { dept: true },
    });
    const depts = [...new Set(peers.map((p) => p.dept).filter(Boolean))] as string[];
    scope = depts.length ? { dept: { in: depts } } : { dept: viewer.dept };
  }

  const entries = await prisma.appraisal_entry.findMany({
    where: {
      org: viewer.org,
      period_id: periodId,
      ...scope,
    },
    select: {
      pesuser_name: true, dept: true, status: true,
      submitted_at: true, verified_at: true, dean_approved_at: true,
    },
  });

  const byDept = new Map<string, { dept: string; total: number; submitted: number; verified: number; deanApproved: number; waiting: string[] }>();
  for (const e of entries) {
    const dept = e.dept ?? 'Unassigned';
    const row = byDept.get(dept) ?? { dept, total: 0, submitted: 0, verified: 0, deanApproved: 0, waiting: [] };
    row.total += 1;
    if (e.submitted_at) row.submitted += 1;
    else row.waiting.push(e.pesuser_name);
    if (e.verified_at) row.verified += 1;
    if (e.dean_approved_at) row.deanApproved += 1;
    byDept.set(dept, row);
  }

  return [...byDept.values()].sort((a, b) => a.dept.localeCompare(b.dept));
}

/** The Dean approves a department's submissions. They do not score individuals. */
export async function deanApproveDepartment(
  viewer: Viewer,
  input: { periodId: number; dept: string },
) {
  const allowed = ORG_ADMIN_ROLES.includes(viewer.role) || viewer.role === 'dean';
  if (!allowed) throw new AppraisalError('Only a Dean or the organization admin can approve a department.', 403);

  const unsubmitted = await prisma.appraisal_entry.count({
    where: { org: viewer.org, period_id: input.periodId, dept: input.dept, submitted_at: null },
  });
  if (unsubmitted > 0) {
    throw new AppraisalError(
      `${unsubmitted} member${unsubmitted === 1 ? '' : 's'} of staff in ${input.dept} have not submitted yet.`,
      409,
    );
  }

  // Submitted is not enough: the departmental administrator has to have checked
  // Forms 8 and 9 against the paper originals first.
  const unverified = await prisma.appraisal_entry.count({
    where: { org: viewer.org, period_id: input.periodId, dept: input.dept, verified_at: null },
  });
  if (unverified > 0) {
    throw new AppraisalError(
      `${unverified} appraisal${unverified === 1 ? '' : 's'} in ${input.dept} still await verification by the departmental administrator.`,
      409,
    );
  }

  return prisma.appraisal_entry.updateMany({
    where: { org: viewer.org, period_id: input.periodId, dept: input.dept },
    data: { dean_approved_at: new Date(), dean_approved_by: viewer.name },
  });
}

/** Cases waiting on the appraisal auditor. The auditor sees both scores and the
 *  reason for referral, which the client confirmed on 10 Aug 2026, but never the
 *  tolerance band. */
export async function auditorQueue(viewer: Viewer) {
  if (viewer.role !== 'auditor' && !ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError('Restricted to the appraisal auditor.', 403);
  }
  const entries = await prisma.appraisal_entry.findMany({
    where: { org: viewer.org, status: 'referred_to_auditor' },
    include: {
      categories: {
        where: { reconciliation: 'referred_to_auditor' },
        select: {
          category: true, appraisal_score: true, hod_score: true,
          hod_justification: true, auditor_score: true, auditor_note: true,
        },
      },
    },
    orderBy: { pesuser_name: 'asc' },
  });
  return entries.map((e) => ({
    id: e.id,
    pesuser_name: e.pesuser_name,
    dept: e.dept,
    model: e.model,
    categories: e.categories,
  }));
}

/** Whether a department has someone able to record Forms 8 and 9.
 *
 *  Academic Forms 8 and 9 are collected on paper by the departmental
 *  administrator. If nobody in the department holds that role the appraisal
 *  cannot be completed, and the screens say so rather than leaving people to
 *  discover it when a save is refused. */
export async function departmentAdminStatus(viewer: Viewer, dept?: string | null) {
  const target = dept ?? viewer.dept ?? null;
  if (!target) return { dept: null, hasAdmin: false, names: [] as string[] };

  const admins = await prisma.pesuser.findMany({
    where: { org: viewer.org, dept: target, role: { in: DEPARTMENT_ADMIN_ROLES } },
    select: { name: true },
  });
  return { dept: target, hasAdmin: admins.length > 0, names: admins.map((a) => a.name) };
}

// ---------------------------------------------------------------------------
// Dashboard notice
// ---------------------------------------------------------------------------

export type AppraisalNotice = {
  active: boolean;
  /** Something this person must act on, with a way to get there. */
  cta?: { title: string; message: string; href: string; action: string } | null;
  /** Worth knowing, but not their turn. */
  notice?: { message: string } | null;
};

/** What this person needs to know about appraisal right now.
 *
 *  Written per role rather than as one generic "a period is open", because the
 *  same period means five different things: forms to fill, forms to verify,
 *  scores to review, a contested score to rule on, or departments to chase.
 */
export async function appraisalNotice(viewer: Viewer): Promise<AppraisalNotice> {
  const period = await currentPeriod(viewer.org);
  const isAdmin = ORG_ADMIN_ROLES.includes(viewer.role);

  // No open period. Only staff need to hear about released results.
  if (!period) {
    const latest = await prisma.appraisal_period.findFirst({
      where: { org: viewer.org, released_at: { not: null } },
      orderBy: { released_at: 'desc' },
      select: { id: true },
    });
    if (latest && !isAdmin) {
      const mine = await prisma.appraisal_entry.findFirst({
        where: { period_id: latest.id, pesuser_name: viewer.name },
        select: { id: true, grade: true },
      });
      if (mine?.grade) {
        return {
          active: false,
          cta: {
            title: 'Your appraisal result is ready',
            message: `Your appraisal has been graded ${mine.grade}.`,
            href: `/appraisal/entries/${mine.id}`,
            action: 'View my result',
          },
        };
      }
    }
    return { active: false, cta: null, notice: null };
  }

  const window = `${new Date(period.starts_on).toLocaleDateString()} to ${new Date(
    period.ends_on,
  ).toLocaleDateString()}`;

  if (isAdmin) {
    const [total, submitted, verified] = await Promise.all([
      prisma.appraisal_entry.count({ where: { org: viewer.org, period_id: period.id } }),
      prisma.appraisal_entry.count({
        where: { org: viewer.org, period_id: period.id, submitted_at: { not: null } },
      }),
      prisma.appraisal_entry.count({
        where: { org: viewer.org, period_id: period.id, verified_at: { not: null } },
      }),
    ]);
    return {
      active: true,
      cta: {
        title: 'Your appraisal period is open',
        message:
          total === 0
            ? `Open for ${window}. Nobody has been added to it yet.`
            : `${submitted} of ${total} submitted, ${verified} verified. Open for ${window}.`,
        href: '/models/appraisal',
        action: 'Open Staff appraisal',
      },
    };
  }

  if (DEPARTMENT_ADMIN_ROLES.includes(viewer.role)) {
    const waiting = await prisma.appraisal_entry.count({
      where: { org: viewer.org, period_id: period.id, dept: viewer.dept, status: 'submitted' },
    });
    if (waiting > 0) {
      return {
        active: true,
        cta: {
          title: 'Appraisals await your verification',
          message: `${waiting} appraisal${waiting === 1 ? '' : 's'} in ${viewer.dept} need Forms 8 and 9 checked against the paper originals.`,
          href: '/appraisal/entries',
          action: 'Verify them',
        },
      };
    }
    return {
      active: true,
      notice: { message: `An appraisal period is open for ${window}. Nothing is waiting on you yet.` },
    };
  }

  if (viewer.role === 'hod') {
    const toReview = await prisma.appraisal_entry.count({
      where: { org: viewer.org, period_id: period.id, dept: viewer.dept, status: 'verified' },
    });
    if (toReview > 0) {
      return {
        active: true,
        cta: {
          title: 'Appraisals await your review',
          message: `${toReview} verified appraisal${toReview === 1 ? '' : 's'} in ${viewer.dept} are ready for your scores.`,
          href: '/appraisal/entries',
          action: 'Review them',
        },
      };
    }
  }

  if (viewer.role === 'auditor') {
    const referred = await prisma.appraisal_entry.count({
      where: { org: viewer.org, period_id: period.id, status: 'referred_to_auditor' },
    });
    if (referred > 0) {
      return {
        active: true,
        cta: {
          title: 'Contested scores await your decision',
          message: `${referred} appraisal${referred === 1 ? '' : 's'} were contested and need your final figure.`,
          href: '/appraisal/auditor',
          action: 'Review them',
        },
      };
    }
  }

  // Everyone else: their own appraisal.
  const mine = await prisma.appraisal_entry.findFirst({
    where: { org: viewer.org, period_id: period.id, pesuser_name: viewer.name },
    select: { id: true, status: true },
  });

  if (!mine) {
    // A head of department reads this for their department first, so tell them
    // where the department stands rather than only that they are not in it.
    if (DEPARTMENT_SCOPED_ROLES.includes(viewer.role)) {
      const [total, outstanding] = await Promise.all([
        prisma.appraisal_entry.count({
          where: { org: viewer.org, period_id: period.id, dept: viewer.dept },
        }),
        prisma.appraisal_entry.count({
          where: { org: viewer.org, period_id: period.id, dept: viewer.dept, submitted_at: null },
        }),
      ]);
      return {
        active: true,
        notice: {
          message:
            total === 0
              ? `An appraisal period is open for ${window}. Nobody in ${viewer.dept ?? 'your department'} has been added to it yet.`
              : `An appraisal period is open for ${window}. ${outstanding} of ${total} in ${viewer.dept} have yet to submit.`,
        },
      };
    }
    return {
      active: true,
      notice: {
        message: `An appraisal period is open for ${window}. You have not been added to it yet.`,
      },
    };
  }
  if (mine.status === 'draft') {
    return {
      active: true,
      cta: {
        title: 'Your appraisal is open',
        message: `Complete your forms before the period closes on ${new Date(period.ends_on).toLocaleDateString()}.`,
        href: `/appraisal/entries/${mine.id}`,
        action: 'Fill my forms',
      },
    };
  }
  if (mine.status === 'awaiting_staff') {
    return {
      active: true,
      cta: {
        title: 'Your head of department adjusted a score',
        message: 'Accept it, or contest it and have the auditor decide.',
        href: `/appraisal/entries/${mine.id}`,
        action: 'Respond',
      },
    };
  }

  return {
    active: true,
    notice: { message: `Your appraisal is ${stageLabel(mine.status)}. Nothing is waiting on you.` },
  };
}

function stageLabel(status: string) {
  return stageOf(status).label.toLowerCase();
}

/** The data integrity test for the appraisal model, across every department.
 *
 *  The subject of the test is what staff actually entered: the sum of a person's
 *  recorded category scores. An entry still in draft has nothing to test, so it
 *  is left out rather than counted as a zero — which would otherwise drag the
 *  quartiles down and manufacture outliers at the top.
 *
 *  Only the organization admin may run it: it names individuals whose figures sit
 *  outside their department's band, which is not something a colleague should see. */
export async function runAppraisalIntegrity(viewer: Viewer, periodId: number): Promise<IntegrityReport> {
  if (!ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new AppraisalError('Only the organization administrator can run the data integrity test.', 403);
  }

  const period = await prisma.appraisal_period.findFirst({
    where: { id: periodId, org: viewer.org },
  });
  if (!period) throw new AppraisalError('Appraisal period not found.', 404);

  const entries = await prisma.appraisal_entry.findMany({
    where: { org: viewer.org, period_id: periodId, status: { not: 'draft' } },
    include: { categories: { select: { recorded_score: true, appraisal_score: true } } },
  });

  const subjects: IntegritySubject[] = [];
  for (const e of entries) {
    const scores = e.categories
      .map((c) => c.recorded_score ?? c.appraisal_score)
      .filter((v): v is NonNullable<typeof v> => v !== null && v !== undefined)
      .map(Number)
      .filter((n) => Number.isFinite(n));
    if (scores.length === 0) continue;
    subjects.push({
      name: e.pesuser_name,
      dept: e.dept,
      score: scores.reduce((sum, n) => sum + n, 0),
    });
  }

  return runIntegrityTest('appraisal', periodId, subjects);
}
