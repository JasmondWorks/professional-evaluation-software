'use client';

import { useEffect, useMemo, useState } from 'react';
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

/** The annual targets an appraisal is measured against. Editable because the
 *  source scheme is described as an example, and because an institution may set
 *  its own. A blank cell means the category is not targeted for that position,
 *  and it is left out of the combined total rather than counted as zero. */
export default function TargetEditor({ periodId }: { periodId: number }) {
  const [rows, setRows] = useState<TargetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

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

  async function save(key: string, body: Record<string, unknown>) {
    const raw = drafts[key];
    if (raw === undefined || raw.trim() === '') return;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      setError('A target must be a number of zero or more.');
      return;
    }
    setSaving(key);
    setError(null);
    try {
      const res = await apiFetch('/api/appraisal-v2/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, target: value, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save the target.');
      setRows((prev) => {
        const others = prev.filter((r) => r.id !== data.target.id);
        return [...others, data.target];
      });
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      notify.success('Target saved.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  function cell(key: string, current: number | undefined, body: Record<string, unknown>) {
    const draft = drafts[key];
    const dirty = draft !== undefined && draft !== String(current ?? '');
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          value={draft ?? (current ?? '')}
          onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
          aria-label={`Target for ${key.replace(/[:_]/g, ' ')}`}
          className="w-20 rounded-lg border border-line bg-surface px-2 py-1 text-sm tabular-nums outline-none transition-shadow focus:border-pes-400 focus-visible:shadow-focus"
        />
        {dirty ? (
          <Button size="sm" variant="subtle" loading={saving === key} onClick={() => save(key, body)}>
            Save
          </Button>
        ) : null}
      </div>
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
        <h2 className="text-lg font-semibold text-strong">Annual targets</h2>
        <p className="mt-0.5 text-sm text-muted">
          What a staff member is expected to reach in a year. Observed output is measured
          against these to produce the RTP and the grade.
        </p>
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
