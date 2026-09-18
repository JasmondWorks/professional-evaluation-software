'use client';

import { APPRAISAL_STAGES, isMyTurn, stageOf } from '@/app/lib/appraisal/instrument';

/** Where an appraisal has got to, and who it is waiting on.
 *
 *  Shown to every role on the entry screen. Without it a member of staff who has
 *  submitted sees only locked forms and no explanation, and a head of department
 *  has no way to tell whether the delay is the department's or their own. */
export default function StageBanner({
  status,
  role,
  verifiedBy,
  verifiedAt,
}: {
  status: string;
  role: string;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
}) {
  const stage = stageOf(status);
  const mine = isMyTurn(status, role);

  // The auditor step is a detour, not a stage everyone passes through, so it is
  // left off the track and called out in the text instead.
  const track = APPRAISAL_STAGES.filter((s) => s.key !== 'referred_to_auditor');
  const trackIndex = track.findIndex((s) => s.key === stage.key);

  return (
    <section
      aria-label="Appraisal progress"
      className={`mb-6 rounded-xl border p-4 ${
        mine ? 'border-pes-300 bg-pes-50' : 'border-line bg-canvas'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-base font-semibold text-strong">{stage.label}</h2>
        {mine ? (
          <span className="rounded-full bg-pes px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
            Your turn
          </span>
        ) : null}
      </div>

      <p className="mt-1 text-sm text-body">
        {mine ? 'Waiting on you' : `Waiting on ${stage.waitingOn}`}
        {!mine && stage.key !== 'approved' ? '.' : ''}
      </p>

      {verifiedAt ? (
        <p className="mt-1 text-xs text-muted">
          Forms 8 and 9 verified{verifiedBy ? ` by ${verifiedBy}` : ''} on{' '}
          {new Date(verifiedAt).toLocaleDateString()}.
        </p>
      ) : null}

      {/* A plain track rather than icons: the point is position, not decoration. */}
      <ol className="mt-3 flex flex-wrap gap-x-1 gap-y-2">
        {track.map((s, i) => {
          const done = trackIndex > -1 && i < trackIndex;
          const here = s.key === stage.key;
          return (
            <li key={s.key} className="flex items-center gap-1">
              <span
                aria-current={here ? 'step' : undefined}
                className={`rounded-md px-2 py-1 text-xs ${
                  here
                    ? 'bg-pes font-semibold text-white'
                    : done
                      ? 'bg-pes-100 text-pes-700'
                      : 'bg-surface text-muted'
                }`}
              >
                {s.label}
              </span>
              {i < track.length - 1 ? (
                <span aria-hidden="true" className="text-muted">
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {stage.key === 'referred_to_auditor' ? (
        <p className="mt-3 text-sm text-body">
          One or more scores were contested, so this appraisal has left the normal
          sequence and sits with the external auditor.
        </p>
      ) : null}
    </section>
  );
}
