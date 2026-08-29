'use client';

import { useState } from 'react';
import { Trash } from 'iconsax-react';
import { apiFetch } from '@/app/utils/apiFetch';
import { notify } from '@/lib/toast';

// Taking one run back out of a model's history.
//
// Every history here feeds a prediction — a line fitted through the stored runs
// — so a mistyped evaluation is not a harmless extra row, it bends every
// extrapolation drawn after it. Hence a per-row removal rather than a bulk
// clear: the client is pruning bad runs, not wiping the record.

type Props = {
  /** Which history table the row lives in; must match the route's allow-list. */
  source: 'personnel-utilization' | 'supervision-cost' | 'index';
  id: number;
  /** What to say in the confirmation, e.g. "the run from 3 June". */
  label?: string;
  /** Drop the row from the caller's state once the server has accepted. */
  onRemoved: (id: number) => void;
};

export default function RemoveRecordButton({ source, id, label, onRemoved }: Props) {
  const [busy, setBusy] = useState(false);

  async function remove() {
    // A deletion with no undo, so it is worth one question first.
    if (
      !window.confirm(
        `Remove ${label ?? 'this record'} from the history? This cannot be undone, and any prediction fitted through the history will change.`,
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const res = await apiFetch(`/api/model-history?source=${source}&id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Could not remove that record.');
      onRemoved(id);
      notify.success('Record removed.');
    } catch (err: any) {
      notify.error(err.message ?? 'Could not remove that record.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label={`Remove ${label ?? 'record'}`}
      title="Remove this record"
      className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-danger-700 transition-colors hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash size={14} />
      {busy ? 'Removing…' : 'Remove'}
    </button>
  );
}
