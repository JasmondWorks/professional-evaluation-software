'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Badge, Button, Card, CardBody, CardHeader, Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import { useIsAcademicOrg } from '@/app/lib/useOrgCategory';
import {
  CATEGORY_KEYS,
  CategoryKey,
  NON_ACADEMIC_CADRES,
  POSITIONS,
} from '@/app/lib/appraisal/instrument';

type TargetRow = {
  id: number;
  model: string;
  position: string | null;
  post: string | null;
  cadre: string | null;
  category: string | null;
  target: string;
};

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  teaching: 'Teaching',
  research: 'Research',
  administration: 'Administration',
  community: 'Community service',
  activity: 'Activity',
  training: 'Training quality',
  fault_solving: 'Fault solving',
};

const ACADEMIC_CATEGORIES = CATEGORY_KEYS.academic;

const GRADE_LABEL = (key: string) => `Grade ${key.replace('grade_', '')}`;

/** The annual targets an appraisal is measured against.
 *
 *  Read-only. The figures are copied in when the period opens, from whichever
 *  template the organization has in force, so this screen reports them rather
 *  than setting them. Changing them means duplicating a template.
 *
 *  A blank cell means the category is not targeted for that position, and it is
 *  left out of the combined total rather than counted as zero. */
export default function TargetEditor({ periodId }: { periodId: number }) {
  const [rows, setRows] = useState<TargetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inForce, setInForce] = useState<
    { scope: string; name: string; isSystem: boolean; version: number }[]
  >([]);

  // A company or public-sector organization has no academic staff, so the
  // academic positions and their targets have no meaning there.
  const isAcademicOrg = useIsAcademicOrg();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/appraisal-v2/target?periodId=${periodId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not load targets.');
        if (!cancelled) setRows(data.targets);

        // Non-fatal: the table is still readable without the badge.
        const t = await apiFetch('/api/appraisal-v2/templates');
        if (t.ok) {
          const td = await t.json();
          if (!cancelled) {
            setInForce(
              (td.scopes ?? [])
                .map((s: any) => s.templates.find((x: any) => x.inForce) ?? null)
                .filter(Boolean)
                .map((x: any) => ({ scope: x.scope, name: x.name, isSystem: x.isSystem, version: x.version })),
            );
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [periodId]);

  const academic = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r.model !== 'academic' || !r.position || !r.category) continue;
      map.set(`${r.position}:${r.category}`, Number(r.target));
    }
    return map;
  }, [rows]);

  const nonAcademic = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r.model !== 'non_academic' || !r.cadre) continue;
      map.set(r.cadre, Number(r.target));
    }
    return map;
  }, [rows]);

  /** Targets are read here, never edited.
   *
   *  They are copied in from whichever template the organization has in force,
   *  so an input on this screen would let somebody type a figure no template
   *  accounts for, with nothing recording what the standard was. Changing the
   *  figures means duplicating a template, which is what the header links to. */
  function cell(key: string, current: number | undefined, _body: Record<string, unknown>) {
    return current === undefined ? (
      <span className="text-muted">not set</span>
    ) : (
      <span className="tabular-nums text-strong">{current}</span>
    );
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pes border-t-transparent" />
      </div>
    );
  }

  const academicPanel = (
    <>
        <p className="mb-3 text-sm text-body">
          Forms 8 and 9 both count towards Teaching, so they share one target.
          Administration is set by the post a person holds rather than by position, so
          it is left blank here.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <thead>
              <tr className="border-b border-line bg-canvas">
                <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted">
                  Position
                </th>
                {ACADEMIC_CATEGORIES.map((c) => (
                  <th
                    key={c}
                    className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted"
                  >
                    {CATEGORY_LABELS[c]}
                  </th>
                ))}
                <th className="px-3 py-2 text-right text-xs uppercase tracking-wide text-muted">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {POSITIONS.map((p) => {
                const total = ACADEMIC_CATEGORIES.reduce(
                  (sum, c) => sum + (academic.get(`${p.key}:${c}`) ?? 0),
                  0,
                );
                return (
                  <tr key={p.key}>
                    <td className="px-3 py-2 font-medium text-strong">{p.label}</td>
                    {ACADEMIC_CATEGORIES.map((c) => (
                      <td key={c} className="px-3 py-2">
                        {c === 'administration' ? (
                          <span className="text-muted">by post</span>
                        ) : (
                          cell(`${p.key}:${c}`, academic.get(`${p.key}:${c}`), {
                            model: 'academic',
                            position: p.key,
                            category: c,
                          })
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-semibold text-strong">
                      {total || <span className="font-normal text-muted">not set</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
    </>
  );

  const gradePanel = (
    <>
        <p className="mb-3 text-sm text-body">
          One total target per grade, covering all three categories together.
        </p>
        <div className="space-y-5">
          {NON_ACADEMIC_CADRES.map((band) => (
            <div key={band.group}>
              <div className="mb-2 flex flex-wrap items-baseline gap-2">
                <h3 className="text-sm font-semibold text-strong">{band.group}</h3>
                {band.roles ? (
                  <span className="text-xs text-muted">{band.roles}</span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {band.grades.map((g) => (
                  <div
                    key={g}
                    className="flex items-center gap-2 rounded-lg border border-line px-3 py-2"
                  >
                    <span className="text-sm text-body">{GRADE_LABEL(g)}</span>
                    {cell(g, nonAcademic.get(g), { model: 'non_academic', cadre: g })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {nonAcademic.size === 0 ? (
          <Alert tone="warning" className="mt-4">
            No {isAcademicOrg ? 'non-academic ' : ''}targets are set for this period
            yet. Until a grade has a target, staff on that grade can be scored but
            cannot receive an RTP or a grade.
          </Alert>
        ) : (
          <p className="mt-4 text-sm text-muted">
            <Badge tone="success">{nonAcademic.size} of 17</Badge> grades configured.
          </p>
        )}
    </>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-strong">Annual targets</h2>
            <p className="mt-0.5 text-sm text-muted">
              What a staff member is expected to reach in a year. Observed output is measured
              against these to produce the RTP and the grade.
            </p>
          </div>
          <Button href="/appraisal/templates" variant="outline" size="sm">
            Manage templates
          </Button>
        </div>

        {/* Which scheme these figures came from. The client asked on 26 Aug 2026
            that this be on screen, and that only the organization admin and
            Establishment see it — which is exactly who can reach this screen. */}
        {inForce.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted">Scored against</span>
            {inForce.map((t) => (
              <Badge key={t.scope} tone={t.isSystem ? 'neutral' : 'brand'}>
                {isAcademicOrg ? `${t.scope === 'academic' ? 'Academic' : 'Non-academic'}: ` : ''}
                {t.name}
                {t.version > 1 ? ` (v${t.version})` : ''}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardHeader>
      <CardBody>
        {error ? (
          <Alert tone="danger" className="mb-4">
            {error}
          </Alert>
        ) : null}

        {isAcademicOrg ? (
          <Tabs defaultValue="academic">
            <TabsList>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="non_academic">Non-academic</TabsTrigger>
            </TabsList>

            <TabsContent value="academic">{academicPanel}</TabsContent>
            <TabsContent value="non_academic">{gradePanel}</TabsContent>
          </Tabs>
        ) : (
          // No academic staff exist here, so there is nothing to switch between:
          // the grade targets are the whole of it and tabs would be one control
          // with one option.
          gradePanel
        )}
      </CardBody>
    </Card>
  );
}
