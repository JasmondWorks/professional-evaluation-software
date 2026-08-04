'use client'
import { notify } from "@/lib/toast";
import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import CriteriaForm from './criteria/form'
import { getAccessToken } from '@/app/utils/auth'
import { apiFetch } from '@/app/utils/apiFetch';
import Button from "@/app/components/ui/Button";
import PageHeader from "@/app/components/ui/PageHeader";

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
        const token = getAccessToken()
        if (!token) return
        const user: JWTPayload = jwtDecode(token)

        const [staffRes, hodRes] = await Promise.all([
          apiFetch(`/api/userPerformance`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: user.name ?? '' }),
          }),
          apiFetch(`/api/counterUserPerformance`, {
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
      const token = getAccessToken()
      if (!token) return notify.error('No token found')
      const user: JWTPayload = jwtDecode(token)

      const res = await apiFetch('/api/acceptRejectPerformance', {
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
      notify.success(`You have ${decision} the HOD counter score for ${section} `)
      window.location.reload()
    } catch (err) {
      console.error(err)
      notify.error('Error performing accept/reject')
    }
  }

  /* ---------------- Form Validation ---------------- */
  const isStepComplete = (index: number) =>
    steps[index].criteria.every((_, i) => steps[index].ratings[i] !== undefined && !isNaN(steps[index].ratings[i]))

  /* ---------------- Submit ---------------- */
  const handleFinalSubmit = async () => {
    const incomplete = steps.find((_, i) => !isStepComplete(i))
    if (incomplete) {
      notify.error(`Please complete all fields in "${incomplete.title}"`)
      return
    }

    const token = getAccessToken()
    if (!token) return notify.error('No token found')

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
      const res = await apiFetch('/api/savePerformance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, token }),
      })

      if (!res.ok) throw new Error('Error saving performance ❌')
      notify.success('Performance submitted successfully')
    } catch (err) {
      console.error(err)
      notify.error('Error submitting performance')
    }
  }

  /* ---------------- Render Logic ---------------- */
  const current = steps[step]
  const staffVal = staffScores?.[0]?.[current.key]
  const hodVal = hodScores?.[0]?.[current.key]
  const hasScores = staffVal !== undefined || hodVal !== undefined

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pes border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Performance data entry"
        subtitle={`Step ${step + 1} of ${steps.length} — ${current.title}`}
      />

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-6" aria-hidden>
        {steps.map((s, i) => (
          <div key={s.key} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-pes' : 'bg-line'}`}
            />
            <p className={`mt-1.5 text-xs font-medium truncate ${i === step ? 'text-pes-700' : 'text-muted'}`}>
              {s.title}
            </p>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>
        {hasScores ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-strong">{current.title} — submitted scores</h2>
            <div className="bg-surface border border-line rounded-xl shadow-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-canvas text-left text-xs font-semibold text-muted uppercase tracking-wide">
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Staff score</th>
                    <th className="px-4 py-3">HOD counter score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-3 text-body">{current.title}</td>
                    <td className="px-4 py-3 tabular-nums text-strong">{staffVal ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums text-strong">{hodVal ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleAcceptReject(current.key, 'accepted')}>
                Accept
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleAcceptReject(current.key, 'rejected')}>
                Reject
              </Button>
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
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Prev
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : !hasScores ? (
          <Button onClick={handleFinalSubmit}>
            Submit all
          </Button>
        ) : null}
      </div>
    </div>
  )
}
