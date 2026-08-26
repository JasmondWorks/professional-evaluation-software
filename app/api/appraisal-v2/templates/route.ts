import { NextResponse } from 'next/server';
import { viewerFrom } from '../_auth';
import {
  TemplateError,
  approveTemplate,
  duplicateTemplate,
  listTemplates,
  markTemplateReady,
  newTemplateVersion,
  putInForce,
  scopesForCategory,
  setTemplateTarget,
  templateTargets,
  type TemplateScope,
} from '@/app/lib/appraisal/templates';

export const dynamic = 'force-dynamic';

/** Appraisal target templates.
 *
 *  GET  ?scope=academic            list what this org may choose from
 *  GET  ?templateId=…              one template with its targets
 *  POST { action: … }              the lifecycle, one action per call
 *
 *  Every action is restricted to the organization admin and Establishment
 *  inside the service, and every read is scoped to templates this organization
 *  can see: its own, plus the PES standard. */

function fail(err: unknown) {
  if (err instanceof TemplateError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error('appraisal template route error:', err);
  return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
}

function parseScope(raw: string | null): TemplateScope {
  if (raw === 'academic' || raw === 'non_academic') return raw;
  throw new TemplateError('Give a scheme: academic or non_academic.', 400);
}

export async function GET(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const url = new URL(req.url);

    const templateId = url.searchParams.get('templateId');
    if (templateId) {
      const { template, targets } = await templateTargets(viewer, templateId);
      return NextResponse.json({
        template: {
          id: template.id,
          name: template.name,
          scope: template.scope,
          isSystem: template.is_system,
          status: template.status,
          version: template.version,
          readyBy: template.ready_by,
          approvedBy: template.approved_by,
          // The screen shows read-only cells and a "Duplicate to edit" action
          // rather than inputs nobody can explain.
          editable: !template.is_system && template.org === viewer.org && template.status === 'draft',
        },
        targets: targets.map((t) => ({
          id: t.id,
          position: t.position,
          post: t.post,
          cadre: t.cadre,
          category: t.category,
          target: Number(t.target),
        })),
      });
    }

    // No scope given: everything this organization runs. An institution of
    // learning gets both schemes because it employs both kinds of staff.
    const scopeParam = url.searchParams.get('scope');
    const scopes = scopeParam
      ? [parseScope(scopeParam)]
      : scopesForCategory(viewer.productCategory);

    const results = await Promise.all(scopes.map((scope) => listTemplates(viewer, scope)));
    return NextResponse.json({
      scopes: scopes.map((scope, i) => ({ scope, ...results[i] })),
    });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: Request) {
  try {
    const viewer = viewerFrom(req);
    const body = await req.json();

    switch (body?.action) {
      case 'duplicate':
        return NextResponse.json({
          template: await duplicateTemplate(viewer, {
            templateId: String(body.templateId),
            name: String(body.name ?? ''),
          }),
        });

      case 'setTarget':
        return NextResponse.json({
          target: await setTemplateTarget(viewer, {
            templateId: String(body.templateId),
            position: body.position ?? null,
            post: body.post ?? null,
            cadre: body.cadre ?? null,
            category: body.category ?? null,
            target: Number(body.target),
          }),
        });

      case 'markReady':
        return NextResponse.json({
          template: await markTemplateReady(viewer, String(body.templateId)),
        });

      case 'approve':
        return NextResponse.json({
          template: await approveTemplate(viewer, String(body.templateId)),
        });

      case 'newVersion':
        return NextResponse.json({
          template: await newTemplateVersion(viewer, String(body.templateId)),
        });

      case 'putInForce': {
        const result = await putInForce(viewer, {
          scope: parseScope(body.scope ?? null),
          templateId: String(body.templateId),
        });
        return NextResponse.json({
          template: result.template,
          appliesFrom: result.appliesFrom,
          message:
            result.appliesFrom === 'next_period'
              ? 'Saved. This takes effect when the next period is opened; the period currently open keeps the targets it was opened with.'
              : 'Saved. The next period opened will be scored against this template.',
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (err) {
    return fail(err);
  }
}
