'use client'
import { notify } from "@/lib/toast";
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import PageHeader from "@/app/components/ui/PageHeader";
import { getAccessToken } from "@/app/utils/auth";

export default function StudentEvaluationTotals() {
  const router = useRouter();
  const [students, setStudents] = useState(
    Array.from({ length: 15 }, () => ({ name: '', score: '' }))
  )

  // Student data entries are for the department's assigned departmental
  // administrator only — not every HOD, and not a plain employee.
  useEffect(() => {
    const token = getAccessToken();
    const role = token ? jwtDecode<any>(token)?.role : null;
    if (role !== 'dept-admin') router.replace('/data-entry');
  }, [router]);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Student evaluation"
        subtitle="Enter each student's total score to compute the class total and average."
      />

      <div className="bg-surface border border-line rounded-xl shadow-card divide-y divide-line">
        {students.map((student, index) => (
          <div key={index} className="flex gap-3 items-center px-4 py-3">
            <span className="w-8 text-sm text-muted font-medium tabular-nums">#{index + 1}</span>
            <Input
              type="text"
              placeholder="Student name"
              aria-label={`Student ${index + 1} name`}
              value={student.name}
              onChange={e => handleChange(index, 'name', e.target.value)}
              containerClassName="flex-1"
            />
            <Input
              type="number"
              placeholder="Score"
              aria-label={`Student ${index + 1} total score`}
              value={student.score}
              onChange={e => handleChange(index, 'score', e.target.value)}
              className="text-right tabular-nums"
              containerClassName="w-28"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="text-sm text-muted">Total score</p>
          <p className="mt-1 text-2xl font-semibold text-strong tabular-nums">{total}</p>
        </div>
        <div className="rounded-lg border border-pes-100 bg-pes-50 p-4">
          <p className="text-sm text-pes-700">Average score</p>
          <p className="mt-1 text-2xl font-semibold text-pes-700 tabular-nums">{average}</p>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => notify.info(`Average score: ${average}`)}>
          Submit summary
        </Button>
      </div>
    </div>
  )
}
