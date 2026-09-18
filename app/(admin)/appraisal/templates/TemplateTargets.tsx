'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Modal } from '@/app/components/ui';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';
import {
  CATEGORY_KEYS,
  NON_ACADEMIC_CADRES,
  POSITIONS,
  type CategoryKey,
} from '@/app/lib/appraisal/instrument';

/** The targets inside one template.
 *
 *  Editable only while the template is a draft it owns. A system template shows
 *  the same figures as plain text, because the point of the standard is that it
 *  is the same everywhere. */

type Row = {
  id: number;
  position: string | null;
  post: string | null;
  cadre: string | null;
  category: string | null;
  target: number;
};

type Meta = {
  id: string;
  name: string;
  scope: 'academic' | 'non_academic';
  isSystem: boolean;
  status: string;
  version: number;
  editable: boolean;
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

export default function TemplateTargets({
  templateId,
  name,
  onClose,
  onChanged,
}: {
  templateId: string;
  name: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/appraisal-v2/templates?templateId=${templateId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not load this template.');
        if (!cancelled) {
          setMeta(data.template);
          setRows(data.targets);
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
  }, [templateId]);

  const at = (position: string | null, post: string | null, cadre: string | null, category: string | null) =>
    rows.find(
      (r) =>
        (r.position ?? null) === position &&
        (r.post ?? null) === post &&
        (r.cadre ?? null) === cadre &&
        (r.category ?? null) === category,
    );

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
      const res = await apiFetch('/api/appraisal-v2/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setTarget', templateId, target: value, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not save the target.');
      setRows((prev) => {
        const others = prev.filter((r) => r.id !== data.target.id);
        return [...others, { ...data.target, target: Number(data.target.target) }];
      });
      setDrafts((d) => {
        const next = { ...d };
        delete next[key];
        return next;
      });
      notify.success('Target saved.');
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  function cell(key: string, current: number | undefined, body: Record<string, unknown>) {
    if (!meta?.editable) {
      return current === undefined ? (
        <span className="text-muted">not set</span>
      ) : (
        <span className="tabular-nums text-strong">{current}</span>
      );
    }
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

  const academicTable = (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm tabular-nums">
        <thead>
          <tr className="border-b border-line bg-canvas">
            <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted">Position</th>
            {CATEGORY_KEYS.academic.map((c) => (
              <th key={c} className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted">
                {CATEGORY_LABELS[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {POSITIONS.map((p) => (
            <tr key={p.key}>
              <td className="px-3 py-2 font-medium text-strong">{p.label}</td>
              {CATEGORY_KEYS.academic.map((c) => (
                <td key={c} className="px-3 py-2">
                  {c === 'administration' ? (
                    <span className="text-muted">by post</span>
                  ) : (
                    cell(`${p.key}:${c}`, at(p.key, null, null, c)?.target, {
                      position: p.key,
                      category: c,
                    })
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Grades are grouped into cadre bands, and the band is what tells somebody
  // which grade a given role sits in. Flattening them would lose that.
  const gradeTable = (
    <div className="flex flex-col gap-5">
      {NON_ACADEMIC_CADRES.map((band) => (
        <div key={band.group}>
          <div className="mb-2 flex flex-wrap items-baseline gap-2">
            <h3 className="text-sm font-semibold text-strong">{band.group}</h3>
            {band.roles ? <span className="text-xs text-muted">{band.roles}</span> : null}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line bg-canvas">
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted">
                    Grade
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted">
                    Annual target
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {band.grades.map((g) => (
                  <tr key={g}>
                    <td className="px-3 py-2 font-medium text-strong">
                      Grade {g.replace('grade_', '')}
                    </td>
                    <td className="px-3 py-2">
                      {cell(`grade:${g}`, at(null, null, g, null)?.target, { cadre: g })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Modal
      isOpen
      setIsOpen={(o) => (o ? null : onClose())}
      title={name}
      description={
        meta?.isSystem
          ? 'The PES standard. Duplicate it to use different figures.'
          : meta?.editable
            ? 'A draft. Change any figure, then mark it ready when the set is complete.'
            : 'Marked ready, so the figures are frozen. Create a new version to change them.'
      }
      className="max-w-4xl"
      footer={
        <div className="flex items-center justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pes border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {error ? <Alert tone="danger">{error}</Alert> : null}

          {meta && !meta.editable ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={meta.isSystem ? 'neutral' : 'warning'}>
                {meta.isSystem ? 'Read only, this is the standard' : 'Read only, frozen'}
              </Badge>
            </div>
          ) : null}

          {meta?.scope === 'academic' ? academicTable : gradeTable}
        </div>
      )}
    </Modal>
  );
}
