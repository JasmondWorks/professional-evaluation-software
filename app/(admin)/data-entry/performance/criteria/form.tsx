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
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead>
              <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Criteria</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  (Rating) Less Likely → Most Likely
                  </th>
              </tr>
              </thead>
              <tbody>
              {
                  criteria.map((criteria, criteriaIndex) => (
                  <tr key={criteria.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium text-gray-900">{criteria.name}</td>
                      <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                          <button
                              key={rating}
                              onClick={() => handleUpdate(criteriaIndex, rating)}
                              className={`w-8 h-8 rounded-full border-2 font-semibold text-sm transition-all ${
                              ratings[criteriaIndex] === rating
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                              }`}
                          >
                              {rating}
                          </button>
                          ))}
                      </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                      {/* <span className="inline-flex items-center justify-center w-12 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                          {(ratings[criteriaIndex] | 1) / 10 * (criteria.percentage / 1)}
                      </span> */}
                      </td>
                  </tr>
                  ))
              }
              </tbody>
          </table>
        </div>
      {/* <div className="font-semibold">Total: {total.toFixed(2)}</div> */}
    </div>
  )
}
