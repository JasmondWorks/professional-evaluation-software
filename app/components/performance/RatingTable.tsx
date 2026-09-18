'use client';

import React from 'react';
import { RATING_MAX, RATING_MIN, WorkParameter } from '@/app/lib/performance/instrument';

/** The document's summative response scale: every work parameter is rated from
 *  "less likely" to "most likely" on the same 1-10 row (full document, page 102).
 *  Where a parameter carries a point maximum, the rating claims that fraction of
 *  it — the arithmetic is shown so nobody has to guess what a 7 is worth. */
export default function RatingTable({
  parameters,
  ratings,
  onChange,
  showPoints = true,
  disabled = false,
}: {
  parameters: WorkParameter[];
  ratings: Record<number, number>;
  onChange: (index: number, rating: number) => void;
  /** Off for the head's two criteria, whose rows carry no point maxima. */
  showPoints?: boolean;
  disabled?: boolean;
}) {
  const scale = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i);

  return (
    <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-canvas border-b border-line">
              <th className="text-left py-3 px-5 text-xs font-semibold text-muted uppercase tracking-wide">
                Work parameter
              </th>
              <th className="text-center py-3 px-5 text-xs font-semibold text-muted uppercase tracking-wide">
                Less likely &rarr; most likely
              </th>
              {showPoints && (
                <th className="text-right py-3 px-5 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">
                  Points
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {parameters.map((p, i) => {
              const rating = ratings[i];
              const points = rating === undefined ? null : (rating / RATING_MAX) * p.max;
              return (
                <tr key={p.key} className="hover:bg-canvas/60">
                  <td className="py-4 px-5 font-medium text-strong">{p.label}</td>
                  <td className="py-4 px-5">
                    <div
                      className="flex flex-wrap justify-center gap-1.5"
                      role="radiogroup"
                      aria-label={`Rating for ${p.label}`}
                    >
                      {scale.map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          disabled={disabled}
                          aria-checked={rating === value}
                          onClick={() => onChange(i, value)}
                          className={`w-8 h-8 rounded-full border font-semibold text-sm transition-colors focus-visible:shadow-focus disabled:opacity-50 disabled:pointer-events-none ${
                            rating === value
                              ? 'bg-pes text-white border-pes'
                              : 'bg-surface text-body border-line hover:border-pes-300 hover:text-pes-700'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </td>
                  {showPoints && (
                    <td className="py-4 px-5 text-right tabular-nums whitespace-nowrap">
                      <span className={rating === undefined ? 'text-muted' : 'text-strong font-medium'}>
                        {points === null ? '—' : points.toFixed(1)}
                      </span>
                      <span className="text-muted"> / {p.max}</span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
