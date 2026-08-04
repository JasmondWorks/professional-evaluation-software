'use client'
import { useState } from "react"
import LoadingButton from '../../../../../components/ui/LoadingButton';
import { Calendar, Clock, RefreshCw } from 'lucide-react';

// Month day multiplier constants for eq 6.4–6.6
// February: k=27, April/June/September/November: k=29, all others: k=30
const MONTH_CONSTANTS: Record<number, number> = {
  1: 30, 2: 27, 3: 30, 4: 29, 5: 30, 6: 29,
  7: 30, 8: 30, 9: 29, 10: 30, 11: 29, 12: 30,
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

interface DaySchedule {
  month: number;
  day: number;
  times: string[];
  R_day: number;
  R_times: number[];
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

export default function GeneratePage() {
  // Inputs
  const [params, setParams] = useState({
    startMonth: 1,       // Z — month to start the study
    numMonths: 1,        // how many months to study
    daysPerMonth: 10,    // desired working days per month
    workStartTime: 8,    // Y₀ in hours (e.g. 8 = 08:00)
    minDuration: 30,     // A — minimum cycle duration in minutes
    workingHours: 8,     // W — working hours per day
    obsPerDay: 10,       // n — number of observations per day
  })

  const [schedules, setSchedules] = useState<DaySchedule[]>([])
  const [visible, setVisible] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setParams(prev => ({ ...prev, [name]: Number(value) }))
  }

  /**
   * Generate the full schedule per the textbook (Charles-Owaba Ch.6):
   *
   * Days (eq 6.4–6.6):
   *   x_i = floor(1.0 + k × R_i)   where k = 27 (Feb), 29 (Apr/Jun/Sep/Nov), 30 (all others)
   *   Discard if weekend or outside valid day range; repeat until enough working days found.
   *
   * Times (eq 6.7–6.9):
   *   B = (W_minutes - n×A) / n      (eq 6.9, derived from (A+B)/2 = W/n → eq 6.8)
   *   Y_i = Y_{i-1} + A + (B - A)×R_i   (eq 6.7, accumulative from Y₀)
   *   Discard any Y_i that falls outside working hours.
   */
  function generateSchedule() {
    const { startMonth, numMonths, daysPerMonth, workStartTime, minDuration, workingHours, obsPerDay } = params

    // Compute B (eq 6.9): B = (W_min - n×A) / n
    // Textbook eq 6.9 uses 960 for an 8-hr day; generalised: W_min = workingHours×60
    const W_min = workingHours * 60
    const B = (W_min - obsPerDay * minDuration) / obsPerDay
    const A = minDuration
    const Y0 = workStartTime * 60          // start time in minutes
    const endTime = Y0 + W_min             // end of working day in minutes

    const result: DaySchedule[] = []
    const year = new Date().getFullYear()

    for (let mi = 0; mi < numMonths; mi++) {
      const month = ((startMonth - 1 + mi) % 12) + 1
      const k = MONTH_CONSTANTS[month]
      const pickedDays: number[] = []
      const usedR: number[] = []
      let attempts = 0

      while (pickedDays.length < daysPerMonth && attempts < 300) {
        attempts++
        const R = Math.random()
        // eq 6.4–6.6: x_i = floor(1.0 + k × R)
        const x = Math.floor(1.0 + k * R)

        // Validate: must be a real calendar day and not a weekend
        const testDate = new Date(year, month - 1, x)
        const dow = testDate.getDay() // 0=Sun, 6=Sat
        if (
          testDate.getMonth() !== month - 1 ||  // invalid day for this month
          dow === 0 || dow === 6 ||              // weekend
          pickedDays.includes(x)                // already picked
        ) continue

        // Generate observation times for this day (eq 6.7)
        const times: string[] = []
        const R_times: number[] = []
        let currentTime = Y0

        for (let i = 0; i < obsPerDay; i++) {
          const Ri = Math.random()
          R_times.push(Ri)
          // Y_i = Y_{i-1} + [A + (B - A) × R_i]
          currentTime = currentTime + A + (B - A) * Ri

          if (currentTime < endTime) {
            times.push(minutesToTime(currentTime))
          }
        }

        pickedDays.push(x)
        usedR.push(R)
        result.push({ month, day: x, times, R_day: R, R_times })
      }
    }

    // Sort by month then day
    result.sort((a, b) => a.month !== b.month ? a.month - b.month : a.day - b.day)
    setSchedules(result)
    setVisible(true)
  }

  const validB = (params.workingHours * 60 - params.obsPerDay * params.minDuration) / params.obsPerDay

  return (
    <div className="flex flex-col p-6 gap-6 max-w-5xl">
      <div>
        <h1 className="font-bold text-pes text-2xl mb-1">Random Study Day &amp; Hour Generator</h1>
        <p className="text-muted text-sm">
          Generates study dates and observation times using Charles-Owaba equations 6.4–6.9
        </p>
      </div>

      {/* Parameters */}
      <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex flex-col text-sm font-medium text-body">
          Start Month
          <select name="startMonth" value={params.startMonth} onChange={handleChange}
            className="mt-1 border rounded px-3 py-2 focus:ring-2 focus:ring-pes focus:border-transparent">
            {MONTH_NAMES.map((m, i) => (
              <option key={i} value={i + 1}>{m} (k={MONTH_CONSTANTS[i+1]})</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-body">
          Number of Months
          <input type="number" name="numMonths" min={1} max={12} value={params.numMonths}
            onChange={handleChange} className="mt-1 border rounded px-3 py-2" />
        </label>

        <label className="flex flex-col text-sm font-medium text-body">
          Days Per Month (desired)
          <input type="number" name="daysPerMonth" min={1} max={27} value={params.daysPerMonth}
            onChange={handleChange} className="mt-1 border rounded px-3 py-2" />
        </label>

        <label className="flex flex-col text-sm font-medium text-body">
          Work Start Time (hr)
          <input type="number" name="workStartTime" min={0} max={23} step={0.5} value={params.workStartTime}
            onChange={handleChange} className="mt-1 border rounded px-3 py-2" />
          <span className="text-xs text-muted mt-1">Y₀ — e.g. 8 = 08:00</span>
        </label>

        <label className="flex flex-col text-sm font-medium text-body">
          Min Cycle Duration A (min)
          <input type="number" name="minDuration" min={1} max={120} value={params.minDuration}
            onChange={handleChange} className="mt-1 border rounded px-3 py-2" />
          <span className="text-xs text-muted mt-1">Time to complete one tour + rest</span>
        </label>

        <label className="flex flex-col text-sm font-medium text-body">
          Working Hours/Day (W)
          <input type="number" name="workingHours" min={1} max={24} step={0.5} value={params.workingHours}
            onChange={handleChange} className="mt-1 border rounded px-3 py-2" />
        </label>

        <label className="flex flex-col text-sm font-medium text-body">
          Observations/Day (n)
          <input type="number" name="obsPerDay" min={1} max={50} value={params.obsPerDay}
            onChange={handleChange} className="mt-1 border rounded px-3 py-2" />
        </label>

        {/* Derived B */}
        <div className="flex flex-col text-sm font-medium text-body">
          <span>Max Duration B (min) <span className="text-muted font-normal">auto</span></span>
          <div className={`mt-1 border rounded px-3 py-2 font-bold ${validB > 0 ? 'bg-canvas text-pes' : 'bg-danger-50 text-danger-600 border-danger-100'}`}>
            {validB.toFixed(1)}
          </div>
          <span className="text-xs text-muted mt-1">B = (W×60 − n×A) / n  (eq 6.9)</span>
          {validB <= 0 && (
            <span className="text-xs text-danger-600 mt-1">⚠ Reduce obs/day or increase working hours</span>
          )}
        </div>
      </div>

      <LoadingButton
        className="bg-pes w-fit rounded text-white px-8 py-3 flex items-center gap-2 disabled:opacity-50"
        onClick={generateSchedule}
        disabled={validB <= 0}
      >
        <RefreshCw className="w-4 h-4" />
        Generate Schedule
      </LoadingButton>

      {/* Results */}
      {visible && schedules.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pes" />
            Generated Study Schedule
          </h2>
          <p className="text-sm text-muted">
            Formula: days — x = floor(1.0 + k×R) eq 6.4–6.6 &nbsp;|&nbsp;
            times — Y_i = Y_&#123;i-1&#125; + [A + (B−A)×R] eq 6.7
          </p>

          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-pes text-white">
                  <th className="p-3 text-left">Month</th>
                  <th className="p-3 text-left">Day</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">R (day)</th>
                  <th className="p-3 text-left flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Observation Times
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, idx) => {
                  const year = new Date().getFullYear()
                  const dateObj = new Date(year, s.month - 1, s.day)
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                  return (
                    <tr key={idx} className={`border-b border-line ${idx % 2 === 0 ? 'bg-white' : 'bg-canvas'}`}>
                      <td className="p-3 font-medium">{MONTH_NAMES[s.month - 1]}</td>
                      <td className="p-3 font-bold text-pes">{s.day}</td>
                      <td className="p-3 text-body">{dayName}, {MONTH_NAMES[s.month-1].slice(0,3)} {s.day}</td>
                      <td className="p-3 font-mono text-xs text-muted">{s.R_day.toFixed(4)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {s.times.length > 0 ? s.times.map((t, ti) => (
                            <span key={ti} className="bg-pes-50 text-pes-700 border border-pes-100 rounded px-2 py-0.5 font-mono text-xs">
                              {t}
                            </span>
                          )) : (
                            <span className="text-muted text-xs italic">No times within working hours</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-pes-50 border border-blue-200 rounded-lg p-4 text-sm text-pes-700">
            <strong>Parameters used:</strong>&nbsp;
            A = {params.minDuration} min, &nbsp;
            B = {validB.toFixed(1)} min, &nbsp;
            Y₀ = {minutesToTime(params.workStartTime * 60)}, &nbsp;
            n = {params.obsPerDay} obs/day, &nbsp;
            W = {params.workingHours} hrs/day
          </div>
        </div>
      )}
    </div>
  )
}
