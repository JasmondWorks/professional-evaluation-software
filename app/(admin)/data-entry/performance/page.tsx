'use client'
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import CriteriaForm from './criteria/form'
import LoadingButton from '../../../components/ui/LoadingButton'

type JWTPayload = {
  name?: string
  role?: string
  org?: number
}

/* ---------------- Criteria Definitions ---------------- */
const competenceCriteria = [
  { name: 'Hardwork (quantity)', percentage: 55 },
  { name: 'Quality of work', percentage: 10 },
  { name: 'Initiative', percentage: 60 },
  { name: 'Expertise', percentage: 30 },
  { name: 'Supervision', percentage: 40 },
  { name: 'Reporting', percentage: 20 },
  { name: 'Work Planning', percentage: 30 },
  { name: 'Creativity', percentage: 60 },
]

const integrityCriteria = [
  { name: 'Leadership', percentage: 100 },
  { name: 'Dedication', percentage: 70 },
  { name: 'Honesty', percentage: 60 },
  { name: 'Self-discipline', percentage: 40 },
  { name: 'Responsibility', percentage: 40 },
  { name: 'Reliability', percentage: 40 },
  { name: 'Punctuality', percentage: 30 },
  { name: 'Regularity or Absenteeism', percentage: 30 },
]

const compatibilityCriteria = [
  { name: 'Team work', percentage: 80 },
  { name: 'Contributions to the immediate community', percentage: 20 },
  { name: 'Hospitality', percentage: 20 },
  { name: 'Special contributions to section/branch', percentage: 20 },
  { name: 'Relation to customer', percentage: 10 },
]

const resourceCriteria = [
  { name: 'Use of resources', percentage: 400 },
]

/* ---------------- Helpers ---------------- */
function weightedTotal(criteria: { percentage: number }[], ratings: Record<number, number>) {
  return criteria.reduce((sum, c, i) => {
    const r = ratings[i] ?? 1
    return sum + (r / 10) * c.percentage
  }, 0)
}

/* ---------------- Main Component ---------------- */
export default function PerformanceStep() {
  const [step, setStep] = useState(0)
  const [competenceRatings, setCompetenceRatings] = useState<Record<number, number>>({})
  const [integrityRatings, setIntegrityRatings] = useState<Record<number, number>>({})
  const [compatibilityRatings, setCompatibilityRatings] = useState<Record<number, number>>({})
  const [resourceRatings, setResourceRatings] = useState<Record<number, number>>({})
  const [staffScores, setStaffScores] = useState<any>(null)
  const [hodScores, setHodScores] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  /* ---------------- Steps ---------------- */
  const steps = [
    { title: 'Competence', key: 'competence', criteria: competenceCriteria, ratings: competenceRatings, setRatings: setCompetenceRatings },
    { title: 'Integrity', key: 'integrity', criteria: integrityCriteria, ratings: integrityRatings, setRatings: setIntegrityRatings },
    { title: 'Compatibility', key: 'compatibility', criteria: compatibilityCriteria, ratings: compatibilityRatings, setRatings: setCompatibilityRatings },
    { title: 'Use of Resources', key: 'use_of_resources', criteria: resourceCriteria, ratings: resourceRatings, setRatings: setResourceRatings },
  ]

  /* ---------------- Fetch Scores ---------------- */
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) return
        const user: JWTPayload = jwtDecode(token)

        const [staffRes, hodRes] = await Promise.all([
          fetch(`/api/userPerformance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: user.name ?? '' }),
          }),
          fetch(`/api/counterUserPerformance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: user.name ?? '' }),
          }),
        ])

        const staffData = staffRes.ok ? await staffRes.json() : null
        const hodData = hodRes.ok ? await hodRes.json() : null
        setStaffScores(staffData)
        setHodScores(hodData)
      } catch (err) {
        console.error('Error fetching performance data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchScores()
  }, [])

  /* ---------------- Accept / Reject ---------------- */
  const handleAcceptReject = async (section: string, decision: 'accepted' | 'rejected') => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return alert('No token found ❌')
      const user: JWTPayload = jwtDecode(token)

      const res = await fetch('/api/acceptRejectPerformance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          decision,
          staff: staffScores?.user_name ?? user.name,
          user: user.name,
        }),
      })

      if (!res.ok) throw new Error('Accept/Reject failed ❌')
      alert(`You have ${decision} the HOD counter score for ${section} ✅`)
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('Error performing accept/reject ❌')
    }
  }

  /* ---------------- Form Validation ---------------- */
  const isStepComplete = (index: number) =>
    steps[index].criteria.every((_, i) => steps[index].ratings[i] !== undefined && !isNaN(steps[index].ratings[i]))

  /* ---------------- Submit ---------------- */
  const handleFinalSubmit = async () => {
    const incomplete = steps.find((_, i) => !isStepComplete(i))
    if (incomplete) {
      alert(`Please complete all fields in "${incomplete.title}" ✅`)
      return
    }

    const token = localStorage.getItem('access_token')
    if (!token) return alert('No token found ❌')

    const user: JWTPayload = jwtDecode(token)
    const payload = {
      pesuser_name: user.name,
      org: user.org,
      payload: {
        competence: weightedTotal(competenceCriteria, competenceRatings).toFixed(2),
        integrity: weightedTotal(integrityCriteria, integrityRatings).toFixed(2),
        compatibility: weightedTotal(compatibilityCriteria, compatibilityRatings).toFixed(2),
        use_of_resources: weightedTotal(resourceCriteria, resourceRatings).toFixed(2),
      },
    }

    try {
      const res = await fetch('/api/savePerformance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Error saving performance ❌')
      alert('Performance submitted successfully ✅')
    } catch (err) {
      console.error(err)
      alert('Error submitting performance ❌')
    }
  }

  /* ---------------- Render Logic ---------------- */
  const current = steps[step]
  const staffVal = staffScores?.[0]?.[current.key]
  const hodVal = hodScores?.[0]?.[current.key]
  const hasScores = staffVal !== undefined || hodVal !== undefined

  if (loading) return <p className="text-center p-8">Loading...</p>

  return (
    <div className="w-full mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold text-center">Performance Data Entry</h1>
      <div className="text-center text-gray-600">
        Step {step + 1} of {steps.length} — <span className="font-semibold">{current.title}</span>
      </div>

      {/* Step content */}
      <div>
        {hasScores ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">{current.title} — Submitted Scores</h2>
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Section</th>
                  <th className="border p-2">Staff Score</th>
                  <th className="border p-2">HOD Counter Score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">{current.title}</td>
                  <td className="border p-2 text-center">{staffVal ?? '—'}</td>
                  <td className="border p-2 text-center">{hodVal ?? '—'}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex gap-4">
              <LoadingButton
                onClick={() => handleAcceptReject(current.key, 'accepted')}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Accept
              </LoadingButton>
              <LoadingButton
                onClick={() => handleAcceptReject(current.key, 'rejected')}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Reject
              </LoadingButton>
            </div>
          </div>
        ) : (
          <CriteriaForm
            title={current.title}
            criteria={current.criteria}
            ratings={current.ratings}
            setRatings={current.setRatings}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <LoadingButton
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </LoadingButton>

        {step < steps.length - 1 ? (
          <LoadingButton onClick={() => setStep(step + 1)} className="px-4 py-2 bg-blue-500 text-white rounded">
            Next
          </LoadingButton>
        ) : !hasScores ? (
          <LoadingButton onClick={handleFinalSubmit} className="px-4 py-2 bg-green-600 text-white rounded">
            Submit All
          </LoadingButton>
        ) : null}
      </div>
    </div>
  )
}
