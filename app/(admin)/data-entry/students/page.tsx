'use client'
import { useState } from 'react'

export default function StudentEvaluationTotals() {
  const [students, setStudents] = useState(
    Array.from({ length: 15 }, () => ({ name: '', score: '' }))
  )

  const handleChange = (index: number, field: 'name' | 'score', value: string) => {
    const updated = [...students]
    updated[index][field] = value
    setStudents(updated)
  }

  const validScores = students
    .map(s => Number(s.score))
    .filter(score => !isNaN(score) && score >= 0)

  const total = validScores.reduce((sum, s) => sum + s, 0)
  const average = validScores.length > 0 ? (total / validScores.length).toFixed(2) : '0.00'

  return (
    <div className="w-11/12 mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        Student Evaluation (Total Scores)
      </h1>

      <div className="space-y-6">
        {students.map((student, index) => (
          <div key={index} className="flex gap-4 items-center border p-3 rounded-lg shadow-sm">
            <span className="w-16 text-gray-500 font-medium">#{index + 1}</span>
            <input
              type="text"
              placeholder="Student name"
              value={student.name}
              onChange={e => handleChange(index, 'name', e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <input
              type="number"
              placeholder="Total score"
              value={student.score}
              onChange={e => handleChange(index, 'score', e.target.value)}
              className="w-32 text-center border rounded p-2"
            />
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold text-center mb-3">Summary</h2>
        <div className="flex justify-around text-lg font-medium">
          <p>Total Score: <span className="font-bold">{total}</span></p>
          <p>Average Score: <span className="font-bold">{average}</span></p>
        </div>
      </div>

      <div className="pt-6 text-center">
        <button
          onClick={() => alert(`Average Score: ${average}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Submit Summary
        </button>
      </div>
    </div>
  )
}
