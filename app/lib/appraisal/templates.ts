/** Appraisal target templates. SERVER ONLY.
 *
 *  A template is a complete named set of targets for one scheme. PES ships one
 *  locked system template per scheme; an organization may define its own.
 *
 *  Settled with the client on 26 August 2026:
 *
 *    1. The academic table on page 22 of the specification is the fixed
 *       standard, despite being captioned "an example". Locked as shipped.
 *    2. Targets an organization has already edited are kept, converted into a
 *       custom template named so it is obvious they are not the standard.
 *       Resetting would silently move results already recorded.
 *    3. A template that has been marked ready is never edited. Editing creates
 *       version n+1 and leaves the original as history.
 *    4. Establishment and Personnel may create custom templates, not only the
 *       organization admin. In this codebase those are the same actor: the role
 *       that opens periods is the one the screens label Estab./Personnel.
 *    5. A second person must approve a template before it can be put in force.
 *       A target set decides every member of staff's grade.
 *    6. One system template per scheme for now, built so more can be added.
 *    7. An academic institution chooses its academic and non-academic templates
 *       independently, since it employs both kinds of staff.
 *
 *  Also: which template is in force is shown to the organization admin and
 *  Establishment only, not to appraisees. */

import prisma from '@/app/api/prisma.dev';
import {
  ACADEMIC_TARGETS,
  ADMINISTRATIVE_POST_TARGETS,
  CATEGORY_KEYS,
  NON_ACADEMIC_TARGETS,
  ORG_ADMIN_ROLES,
  type AppraisalModel,
  type PositionKey,
} from './instrument';

export type TemplateScope = AppraisalModel;
export type TemplateStatus = 'draft' | 'ready' | 'archived';

export class TemplateError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type Viewer = {
  org: string;
  name: string;
  role: string;
  productCategory?: string | null;
};

/** The name PES ships each standard under. Version is on the row, so the name
 *  stays stable across revisions of the scheme. */
export const SYSTEM_TEMPLATE_NAMES: Record<TemplateScope, string> = {
  academic: 'PES standard, academic staff',
  non_academic: 'PES standard, non-academic staff',
};

/** The scheme an organization of this institution type may use.
 *
 *  An institution of learning employs both academic and non-academic staff, so
 *  it gets both. A company or public-sector body has no academic staff and gets
 *  only the grade scheme. */
export function scopesForCategory(productCategory?: string | null): TemplateScope[] {
  return String(productCategory ?? '').trim().toLowerCase() === 'academic'
    ? ['academic', 'non_academic']
    : ['non_academic'];
}

function requireEstab(viewer: Viewer) {
  // ORG_ADMIN_ROLES is the role the appraisal screens label "Estab./Personnel",
  // and it is the role that opens periods. Client answer 4 asked for exactly
  // this actor, so no widening is needed.
  if (!ORG_ADMIN_ROLES.includes(viewer.role)) {
    throw new TemplateError(
      'Only the organization admin or Establishment may manage appraisal templates.',
      403,
    );
  }
}

// ---------------------------------------------------------------------------
// The shipped standards
// ---------------------------------------------------------------------------

type TargetRow = {
  position: string | null;
  post: string | null;
  cadre: string | null;
  category: string | null;
  target: number;
};

/** The academic standard exactly as transcribed from the specification, pages
 *  22 to 24. */
export function academicStandardRows(): TargetRow[] {
  const rows: TargetRow[] = [];
  for (const position of Object.keys(ACADEMIC_TARGETS) as PositionKey[]) {
    for (const category of CATEGORY_KEYS.academic) {
      const target = (ACADEMIC_TARGETS[position] as Record<string, number | null>)[category];
      if (target === null || target === undefined) continue;
      rows.push({ position, post: null, cadre: null, category, target });
    }
  }
  for (const post of ADMINISTRATIVE_POST_TARGETS) {
    rows.push({
      position: null,
      post: post.key,
      cadre: null,
      category: 'administration',
      target: post.target,
    });
  }
  return rows;
}

/** The seventeen grades the client supplied on 10 August 2026. One combined
 *  target per grade rather than one per category. */
export function nonAcademicStandardRows(): TargetRow[] {
  return Object.entries(NON_ACADEMIC_TARGETS).map(([grade, target]) => ({
    position: null,
    post: null,
    cadre: grade,
    category: null,
    target: target as number,
  }));
}

export function standardRowsFor(scope: TemplateScope): TargetRow[] {
  return scope === 'academic' ? academicStandardRows() : nonAcademicStandardRows();
}

/** Create the system templates if they are absent. Idempotent, so it is safe to
 *  call on every boot or from a backfill script.
 *
 *  System templates are born ready and approved: they are the standard, so
 *  there is nothing for a second person to check. */
export async function ensureSystemTemplates(): Promise<Record<TemplateScope, string>> {
  const ids = {} as Record<TemplateScope, string>;

  for (const scope of ['academic', 'non_academic'] as TemplateScope[]) {
    const existing = await prisma.appraisal_template.findFirst({
      where: { is_system: true, scope },
      orderBy: { version: 'desc' },
    });
    if (existing) {
      ids[scope] = existing.id;
      continue;
    }

    const created = await prisma.appraisal_template.create({
      data: {
        scope,
        name: SYSTEM_TEMPLATE_NAMES[scope],
        org: null,
        is_system: true,
        status: 'ready',
        created_by: 'PES',
        ready_at: new Date(),
        ready_by: 'PES',
        approved_at: new Date(),
        approved_by: 'PES',
      },
    });

    await prisma.appraisal_template_target.createMany({
      data: standardRowsFor(scope).map((r) => ({ ...r, template_id: created.id })),
      skipDuplicates: true,
    });

    ids[scope] = created.id;
  }

  return ids;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** Every template this organization may choose from for a scheme: the system
 *  standard plus its own. Another organization's templates are never included. */
export async function listTemplates(viewer: Viewer, scope: TemplateScope) {
  if (!scopesForCategory(viewer.productCategory).includes(scope)) {
    throw new TemplateError(
      scope === 'academic'
        ? 'This organization has no academic staff, so it has no academic scheme.'
        : 'That scheme does not apply to this organization.',
      400,
    );
  }

  const templates = await prisma.appraisal_template.findMany({
    where: {
      scope,
      status: { not: 'archived' },
      OR: [{ is_system: true }, { org: viewer.org }],
    },
    orderBy: [{ is_system: 'desc' }, { created_at: 'asc' }],
    include: { _count: { select: { targets: true } } },
  });

  const choice = await prisma.org_template_choice.findFirst({
    where: { org: viewer.org, scope },
  });

  // An organization that has never chosen is scored against the standard, so
  // that is what "in force" means for it. Reporting nothing would leave the
  // badge blank while periods were being scored against something.
  const effectiveId =
    choice?.template_id ?? templates.find((t) => t.is_system)?.id ?? null;

  return {
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      scope: t.scope as TemplateScope,
      isSystem: t.is_system,
      status: t.status as TemplateStatus,
      version: t.version,
      targetCount: t._count.targets,
      readyBy: t.ready_by,
      approvedBy: t.approved_by,
      // Ready is not enough: a second person must have approved it.
      selectable: t.status === 'ready' && Boolean(t.approved_at),
      inForce: effectiveId === t.id,
      /** True only when the organization actually picked it, as opposed to
       *  falling back to the standard. */
      chosenExplicitly: choice?.template_id === t.id,
    })),
    inForceId: effectiveId,
  };
}

export async function templateTargets(viewer: Viewer, templateId: string) {
  const template = await loadVisible(viewer, templateId);
  const targets = await prisma.appraisal_template_target.findMany({
    where: { template_id: template.id },
    orderBy: { id: 'asc' },
  });
  return { template, targets };
}

async function loadVisible(viewer: Viewer, templateId: string) {
  const t = await prisma.appraisal_template.findFirst({
    where: { id: templateId, OR: [{ is_system: true }, { org: viewer.org }] },
  });
  if (!t) throw new TemplateError('Template not found.', 404);
  return t;
}

/** The template in force for each scheme, for the badge on screen.
 *
 *  Client note, 26 Aug 2026: this is for the organization admin and
 *  Establishment only. Callers must gate on the role before showing it. */
export async function inForceFor(org: string, scopes: TemplateScope[]) {
  const out = [];
  for (const scope of scopes) {
    // Falls back to the standard, which is what an organization that has never
    // chosen is actually scored against.
    const t = await templateInForce(org, scope);
    out.push({
      scope,
      id: t.id,
      name: t.name,
      isSystem: t.is_system,
      version: t.version,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

/** Copy a template into a new draft owned by this organization.
 *
 *  This is the only way a custom template comes into existence, so every one
 *  starts from a complete set and no cell can be missing. Pressing edit on a
 *  system template lands here. */
export async function duplicateTemplate(
  viewer: Viewer,
  input: { templateId: string; name: string },
) {
  requireEstab(viewer);
  const source = await loadVisible(viewer, input.templateId);

  const name = input.name.trim();
  if (name.length < 3) throw new TemplateError('Give the template a name.', 400);

  const clash = await prisma.appraisal_template.findFirst({
    where: { org: viewer.org, scope: source.scope, name, status: { not: 'archived' } },
  });
  if (clash) throw new TemplateError(`This organization already has a template called "${name}".`, 409);

  const sourceTargets = await prisma.appraisal_template_target.findMany({
    where: { template_id: source.id },
  });

  const draft = await prisma.appraisal_template.create({
    data: {
      scope: source.scope,
      name,
      org: viewer.org,
      is_system: false,
      status: 'draft',
      version: 1,
      source_template_id: source.id,
      created_by: viewer.name,
    },
  });

  await prisma.appraisal_template_target.createMany({
    data: sourceTargets.map((t) => ({
      template_id: draft.id,
      position: t.position,
      post: t.post,
      cadre: t.cadre,
      category: t.category,
      target: t.target,
    })),
  });

  return draft;
}

/** Change one target inside a draft.
 *
 *  A system template is never editable, and neither is one already marked ready:
 *  to change a ready template, create a new version. */
export async function setTemplateTarget(
  viewer: Viewer,
  input: {
    templateId: string;
    position?: string | null;
    post?: string | null;
    cadre?: string | null;
    category?: string | null;
    target: number;
  },
) {
  requireEstab(viewer);
  const template = await loadVisible(viewer, input.templateId);

  if (template.is_system) {
    throw new TemplateError(
      'The PES standard cannot be edited. Duplicate it to create your own template.',
      403,
    );
  }
  if (template.org !== viewer.org) {
    throw new TemplateError('That template belongs to another organization.', 403);
  }
  if (template.status !== 'draft') {
    throw new TemplateError(
      'This template has been marked ready and can no longer be edited. Create a new version instead.',
      409,
    );
  }
  if (!Number.isFinite(input.target) || input.target < 0) {
    throw new TemplateError('A target must be zero or more.', 400);
  }

  const keys = [input.position, input.post, input.cadre].filter(Boolean);
  if (keys.length !== 1) {
    throw new TemplateError('Set exactly one of position, post or cadre.', 400);
  }

  const where = {
    template_id: template.id,
    position: input.position ?? null,
    post: input.post ?? null,
    cadre: input.cadre ?? null,
    category: input.category ?? null,
  };
  const existing = await prisma.appraisal_template_target.findFirst({ where });

  return existing
    ? prisma.appraisal_template_target.update({
        where: { id: existing.id },
        data: { target: input.target },
      })
    : prisma.appraisal_template_target.create({ data: { ...where, target: input.target } });
}

/** What a complete template of this scope must cover. Returned as human-readable
 *  labels so the screen can name what is missing. */
async function missingFrom(templateId: string, scope: TemplateScope): Promise<string[]> {
  const have = await prisma.appraisal_template_target.findMany({ where: { template_id: templateId } });
  const key = (r: { position: string | null; post: string | null; cadre: string | null; category: string | null }) =>
    `${r.position ?? ''}|${r.post ?? ''}|${r.cadre ?? ''}|${r.category ?? ''}`;
  const present = new Set(have.map(key));

  return standardRowsFor(scope)
    .filter((r) => !present.has(key(r)))
    .map((r) => (r.position ? `${r.position} / ${r.category}` : r.post ? `post ${r.post}` : `grade ${r.cadre}`));
}

/** Check a draft is complete, then freeze it.
 *
 *  A half-filled set must never be selectable: RTP divides by the sum of the
 *  targets, so a missing cadre silently changes everyone's grade in that scheme. */
export async function markTemplateReady(viewer: Viewer, templateId: string) {
  requireEstab(viewer);
  const template = await loadVisible(viewer, templateId);

  if (template.is_system) throw new TemplateError('The PES standard is already the standard.', 400);
  if (template.org !== viewer.org) throw new TemplateError('That template belongs to another organization.', 403);
  if (template.status !== 'draft') throw new TemplateError('This template is not a draft.', 409);

  const missing = await missingFrom(template.id, template.scope as TemplateScope);
  if (missing.length > 0) {
    throw new TemplateError(
      `This template is not complete. ${missing.length} target${missing.length === 1 ? ' is' : 's are'} missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', and others' : ''}.`,
      400,
    );
  }

  return prisma.appraisal_template.update({
    where: { id: template.id },
    data: { status: 'ready', ready_at: new Date(), ready_by: viewer.name },
  });
}

/** Approve a ready template. Client answer 5: a second person, not the one who
 *  marked it ready. */
export async function approveTemplate(viewer: Viewer, templateId: string) {
  requireEstab(viewer);
  const template = await loadVisible(viewer, templateId);

  if (template.org !== viewer.org) throw new TemplateError('That template belongs to another organization.', 403);
  if (template.status !== 'ready') throw new TemplateError('Only a template marked ready can be approved.', 409);
  if (template.approved_at) throw new TemplateError('This template has already been approved.', 409);
  if (template.ready_by && template.ready_by === viewer.name) {
    throw new TemplateError(
      'A different person must approve this template. You marked it ready yourself.',
      403,
    );
  }

  return prisma.appraisal_template.update({
    where: { id: template.id },
    data: { approved_at: new Date(), approved_by: viewer.name },
  });
}

/** Copy a ready template into a new draft version. Client answer 3: a used
 *  template is superseded, never edited, so a completed appraisal keeps the
 *  numbers it was scored against. */
export async function newTemplateVersion(viewer: Viewer, templateId: string) {
  requireEstab(viewer);
  const source = await loadVisible(viewer, templateId);

  if (source.is_system) {
    throw new TemplateError('Duplicate the PES standard instead of versioning it.', 400);
  }
  if (source.org !== viewer.org) throw new TemplateError('That template belongs to another organization.', 403);
  if (source.status === 'draft') throw new TemplateError('This template is already a draft.', 409);

  const openDraft = await prisma.appraisal_template.findFirst({
    where: { org: viewer.org, name: source.name, scope: source.scope, status: 'draft' },
  });
  if (openDraft) {
    throw new TemplateError('A draft of this template already exists. Finish or discard it first.', 409);
  }

  const latest = await prisma.appraisal_template.findFirst({
    where: { org: viewer.org, name: source.name, scope: source.scope },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const sourceTargets = await prisma.appraisal_template_target.findMany({
    where: { template_id: source.id },
  });

  const draft = await prisma.appraisal_template.create({
    data: {
      scope: source.scope,
      name: source.name,
      org: viewer.org,
      is_system: false,
      status: 'draft',
      version: (latest?.version ?? source.version) + 1,
      source_template_id: source.id,
      created_by: viewer.name,
    },
  });

  await prisma.appraisal_template_target.createMany({
    data: sourceTargets.map((t) => ({
      template_id: draft.id,
      position: t.position,
      post: t.post,
      cadre: t.cadre,
      category: t.category,
      target: t.target,
    })),
  });

  return draft;
}

/** Choose the template this organization scores against for a scheme.
 *
 *  Takes effect at the next period. A period already open keeps the targets it
 *  was opened with, because moving a target under a half-finished appraisal
 *  invalidates every score already recorded against it. */
export async function putInForce(viewer: Viewer, input: { scope: TemplateScope; templateId: string }) {
  requireEstab(viewer);

  if (!scopesForCategory(viewer.productCategory).includes(input.scope)) {
    throw new TemplateError('That scheme does not apply to this organization.', 400);
  }

  const template = await loadVisible(viewer, input.templateId);
  if (template.scope !== input.scope) {
    throw new TemplateError('That template belongs to a different scheme.', 400);
  }
  if (template.status !== 'ready') {
    throw new TemplateError('Only a template marked ready can be put in force.', 409);
  }
  if (!template.approved_at) {
    throw new TemplateError(
      'This template has not been approved yet. A second person must approve it first.',
      409,
    );
  }

  const openPeriod = await prisma.appraisal_period.findFirst({
    where: { org: viewer.org, status: 'open' },
    select: { id: true },
  });

  await prisma.org_template_choice.upsert({
    where: { org_scope: { org: viewer.org, scope: input.scope } },
    update: { template_id: template.id, chosen_by: viewer.name, chosen_at: new Date() },
    create: {
      org: viewer.org,
      scope: input.scope,
      template_id: template.id,
      chosen_by: viewer.name,
    },
  });

  return {
    template,
    // Told plainly rather than silently deferred, so nobody expects this
    // period's grades to change.
    appliesFrom: openPeriod ? 'next_period' : 'immediately',
  };
}

/** The template an organization scores a scheme against, falling back to the
 *  system standard when it has never chosen. */
export async function templateInForce(org: string, scope: TemplateScope) {
  const choice = await prisma.org_template_choice.findFirst({
    where: { org, scope },
    include: { template: true },
  });
  if (choice?.template) return choice.template;

  const system = await prisma.appraisal_template.findFirst({
    where: { is_system: true, scope },
    orderBy: { version: 'desc' },
  });
  if (system) return system;

  // Only reachable if the system templates were never seeded.
  const seeded = await ensureSystemTemplates();
  return prisma.appraisal_template.findUniqueOrThrow({ where: { id: seeded[scope] } });
}
