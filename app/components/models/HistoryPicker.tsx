'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/utils/apiFetch';

// Choosing which stored run feeds the field in front of you.
//
// Several models take values that another model produced — the unit-head
// overload needs H* and K* from personnel utilization, the organization
// structure needs K* and the wasted man-hour D*. Pre-filling those from
// whichever run happened to be most recent guesses at the operator's intent and
// is silently wrong whenever they meant an earlier one. So: show the history and
// let them pick.

export type HistorySource = 'personnel-utilization' | 'supervision-cost';

export type PickerColumn<T> = {
  label: string;
  render: (row: T) => React.ReactNode;
};

type Props<T extends { id: number; created_at: string }> = {
  source: HistorySource;
  /** What the button says, e.g. "Fill from utilization history". */
  label: string;
  columns: PickerColumn<T>[];
  onSelect: (row: T) => void;
};

/** The two histories arrive in different shapes from different routes, so the
 *  fetch is per-source rather than one generic endpoint. */
async function loadRuns(source: HistorySource): Promise<any[]> {
  if (source === 'supervision-cost') {
    const res = await apiFetch('/api/supervisionCost', { method: 'GET' });
    if (!res.ok) throw new Error('Could not load the supervision cost history.');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  }

  // This one is a POST: the route reads the org from the token in the body.
  const res = await apiFetch('/api/getPersonnelUtilization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Could not load the utilization history.');
  const data = await res.json();
  return data.data ?? [];
}

export default function HistoryPicker<T extends { id: number; created_at: string }>({
  source,
  label,
  columns,
  onSelect,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    loadRuns(source)
      .then((data) => {
        if (!cancelled) setRows(data as T[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Could not load the history.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, source]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-pes px-3 py-1.5 text-xs font-medium text-pes transition-colors hover:bg-pes-50"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-strong">Choose a stored run</h2>
                <p className="mt-0.5 text-sm text-muted">
                  The values from the run you pick are copied into the form. Nothing is
                  changed in the history itself.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-muted hover:bg-canvas"
              >
                Close
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto">
              {loading ? (
                <p className="px-6 py-8 text-sm text-muted">Loading the history…</p>
              ) : error ? (
                <p className="px-6 py-8 text-sm text-danger-700">{error}</p>
              ) : rows.length === 0 ? (
                <p className="px-6 py-8 text-sm text-muted">
                  Nothing stored yet. Run the model and save a result first.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-canvas font-medium text-body">
                    <tr>
                      <th className="px-6 py-3 whitespace-nowrap">Date</th>
                      {columns.map((c) => (
                        <th key={c.label} className="px-6 py-3 whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-canvas">
                        <td className="px-6 py-3 whitespace-nowrap text-muted">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                        {columns.map((c) => (
                          <td key={c.label} className="px-6 py-3 text-body">
                            {c.render(row)}
                          </td>
                        ))}
                        <td className="px-6 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(row);
                              setOpen(false);
                            }}
                            className="rounded-md bg-pes px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                          >
                            Use this run
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
