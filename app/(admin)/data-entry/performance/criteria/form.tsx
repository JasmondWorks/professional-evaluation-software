'use client'
import React from 'react'

type Criterion = {
  name: string
  percentage: number
}

export default function CriteriaForm({
  title,
  criteria,
  ratings,
  setRatings,
}: {
  title: string
  criteria: Criterion[]
  ratings: Record<number, number> // index -> rating (1..10)
  setRatings: (val: Record<number, number>) => void
}) {
  const handleUpdate = (index: number, val: number) => {
    const clamped = Math.min(Math.max(val, 1), 10)
    setRatings({
      ...ratings,
      [index]: clamped,
    })
  }

  const rowScore = (index: number, percentage: number) => {
    const r = ratings[index] ?? 1
    return (r / 10) * percentage
  }

  const total = criteria.reduce((sum, c, i) => sum + rowScore(i, c.percentage), 0)

  return (
    <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="font-semibold text-strong">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-canvas border-b border-line">
              <th className="text-left py-3 px-5 text-xs font-semibold text-muted uppercase tracking-wide">Criteria</th>
              <th className="text-center py-3 px-5 text-xs font-semibold text-muted uppercase tracking-wide">
                Rating — less likely → most likely
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {criteria.map((criterion, criteriaIndex) => (
              <tr key={criterion.name} className="hover:bg-canvas/60">
                <td className="py-4 px-5 font-medium text-strong">{criterion.name}</td>
                <td className="py-4 px-5">
                  <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label={`Rating for ${criterion.name}`}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        role="radio"
                        aria-checked={ratings[criteriaIndex] === rating}
                        onClick={() => handleUpdate(criteriaIndex, rating)}
                        className={`w-8 h-8 rounded-full border font-semibold text-sm transition-colors focus-visible:shadow-focus ${
                          ratings[criteriaIndex] === rating
                            ? 'bg-pes text-white border-pes'
                            : 'bg-surface text-body border-line hover:border-pes-300 hover:text-pes-700'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
