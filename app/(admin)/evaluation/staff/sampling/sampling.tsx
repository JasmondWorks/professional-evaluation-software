import React, { useState, useEffect } from 'react';
import { Eye, Target, Calendar, Clock, BarChart3, Plus, Trash2, Users, Calculator } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import { inputBase } from '@/app/components/ui/Input';

interface Position {
  id: string;
  name: string;
  busyObservations: number;
  notBusyObservations: number;
  totalObservations: number;
  utilizationFactor: number;
  performanceRating: number;
  allowancePercentage: number;
  annualWorkingHours: number;
}

interface StudyParameters {
  desiredAccuracy: number; // A in percentage
  confidenceLevel: number; // K (standard deviations)
  preliminaryP: number; // Initial proportion busy
  requiredObservations: number; // Calculated N
}

// Shared field wrapper so every labelled input in this tool is identical.
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-body mb-1.5">{label}</span>
      {children}
    </label>
  );
}

// A titled section container (replaces the old color-coded panels).
function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-line rounded-xl shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-strong flex items-center gap-2">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-pes-50 text-pes-700">
            <Icon className="w-[18px] h-[18px]" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const WorkSamplingTool: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      name: 'Accounts Clerk',
      busyObservations: 25,
      notBusyObservations: 15,
      totalObservations: 40,
      utilizationFactor: 0,
      performanceRating: 110,
      allowancePercentage: 12,
      annualWorkingHours: 2080
    },
    {
      id: '2',
      name: 'Data Entry Officer',
      busyObservations: 30,
      notBusyObservations: 10,
      totalObservations: 40,
      utilizationFactor: 0,
      performanceRating: 95,
      allowancePercentage: 10,
      annualWorkingHours: 2080
    }
  ]);

  const [studyParams, setStudyParams] = useState<StudyParameters>({
    desiredAccuracy: 5, // 5%
    confidenceLevel: 2, // 95% confidence
    preliminaryP: 0.65,
    requiredObservations: 0
  });

  const [scheduleParams, setScheduleParams] = useState({
    workStartTime: 8, // 8 AM
    minimumCycleDuration: 30, // minutes
    observationsPerDay: 10,
    workingMinutesPerDay: 480 // 8 hours
  });

  const [useFactor, setUseFactor] = useState(0.85); // 85% - accounts for legitimate non-work time
  const [randomNumbers, setRandomNumbers] = useState<number[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<string[]>([]);

  const [results, setResults] = useState({
    totalUtilization: 0,
    totalAnnualStandardHours: 0,
    requiredStaffPositions: 0,
    averagePerformance: 0
  });

  // Calculate utilization factors and other metrics
  useEffect(() => {
    const updatedPositions = positions.map(position => {
      const utilizationFactor = position.totalObservations > 0
        ? position.busyObservations / position.totalObservations
        : 0;

      return {
        ...position,
        utilizationFactor
      };
    });
    setPositions(updatedPositions);

    // Calculate preliminary P from all positions
    const totalBusy = positions.reduce((sum, pos) => sum + pos.busyObservations, 0);
    const totalObservations = positions.reduce((sum, pos) => sum + pos.totalObservations, 0);
    const preliminaryP = totalObservations > 0 ? totalBusy / totalObservations : 0.65;

    setStudyParams(prev => ({ ...prev, preliminaryP }));
  }, [positions]);

  // Calculate required observations using the formula
  useEffect(() => {
    const { desiredAccuracy, confidenceLevel, preliminaryP } = studyParams;
    const A = desiredAccuracy / 100; // Convert percentage to decimal
    const K = confidenceLevel;
    const P = preliminaryP;

    // N = K²P(1-P) / A²P²
    const requiredObservations = Math.ceil(
      (K * K * P * (1 - P)) / (A * A * P * P)
    );

    setStudyParams(prev => ({ ...prev, requiredObservations }));
  }, [studyParams.desiredAccuracy, studyParams.confidenceLevel, studyParams.preliminaryP]);

  // Calculate final results
  useEffect(() => {
    if (positions.length === 0) return;

    let totalStandardHours = 0;
    let totalPerformance = 0;
    let totalUtilization = 0;

    positions.forEach(position => {
      // Ui = Utilization Factor
      const Ui = position.utilizationFactor;

      // EAMi = Estimated Annual Man-hours = Ui × Annual Working Hours
      const EAMi = Ui * position.annualWorkingHours;

      // EBMi = Estimated Basic Man-hours = EAMi × (Performance Rating / 100)
      const EBMi = EAMi * (position.performanceRating / 100);

      // ESMi = Estimated Standard Man-hours = EBMi × (1 + Allowance%)
      const ESMi = EBMi * (1 + position.allowancePercentage / 100);

      totalStandardHours += ESMi;
      totalPerformance += position.performanceRating;
      totalUtilization += Ui;
    });

    const averagePerformance = totalPerformance / positions.length;
    const averageUtilization = totalUtilization / positions.length;

    // Required staff = Total Standard Hours / (Annual Hours × Use Factor)
    const requiredStaffPositions = Math.ceil(
      totalStandardHours / (2080 * useFactor)
    );

    setResults({
      totalUtilization: averageUtilization,
      totalAnnualStandardHours: totalStandardHours,
      requiredStaffPositions,
      averagePerformance
    });

  }, [positions, useFactor]);

  const generateObservationSchedule = () => {
    const { workStartTime, minimumCycleDuration, observationsPerDay, workingMinutesPerDay } = scheduleParams;

    // Calculate B using the empirical formula
    const B = (workingMinutesPerDay - minimumCycleDuration) / observationsPerDay;

    // Generate random numbers
    const newRandomNumbers: number[] = [];
    for (let i = 0; i < observationsPerDay; i++) {
      newRandomNumbers.push(Math.random());
    }

    // Sort random numbers in ascending order
    const sortedRandoms = [...newRandomNumbers].sort((a, b) => a - b);

    // Calculate observation times using: Ti = S + A + (B - A) × Ri
    const schedule: string[] = [];
    sortedRandoms.forEach(ri => {
      const timeInMinutes = workStartTime * 60 + minimumCycleDuration + (B - minimumCycleDuration) * ri;
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = Math.floor(timeInMinutes % 60);

      // Only include times within working hours
      if (hours < workStartTime + 8) {
        schedule.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    });

    setRandomNumbers(newRandomNumbers);
    setGeneratedSchedule(schedule);
  };

  const addPosition = () => {
    const newPosition: Position = {
      id: Date.now().toString(),
      name: 'New Position',
      busyObservations: 0,
      notBusyObservations: 0,
      totalObservations: 0,
      utilizationFactor: 0,
      performanceRating: 100,
      allowancePercentage: 10,
      annualWorkingHours: 2080
    };
    setPositions([...positions, newPosition]);
  };

  const removePosition = (id: string) => {
    setPositions(positions.filter(pos => pos.id !== id));
  };

  const updatePosition = (id: string, field: keyof Position, value: string | number) => {
    setPositions(positions.map(pos => {
      if (pos.id === id) {
        const updatedPos = { ...pos, [field]: value };

        // Recalculate total observations when busy or not busy changes
        if (field === 'busyObservations' || field === 'notBusyObservations') {
          updatedPos.totalObservations = updatedPos.busyObservations + updatedPos.notBusyObservations;
        }

        return updatedPos;
      }
      return pos;
    }));
  };

  const resultCards = [
    { label: 'Average utilization', value: `${(results.totalUtilization * 100).toFixed(1)}%` },
    { label: 'Total annual standard hours', value: results.totalAnnualStandardHours.toFixed(0) },
    { label: 'Required staff positions', value: results.requiredStaffPositions },
    { label: 'Average performance', value: `${results.averagePerformance.toFixed(1)}%` },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-strong flex items-center gap-2.5">
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-pes text-white">
              <Eye className="w-5 h-5" />
            </span>
            Work Sampling Analysis
          </h1>
          <p className="mt-1 text-sm text-muted max-w-2xl">
            Statistical approach to workforce planning &amp; utilization analysis.
          </p>
        </div>

        {/* Study Parameters */}
        <Section icon={Target} title="Study parameters">
          <div className="grid md:grid-cols-4 gap-4">
            <Field label="Desired accuracy (A %)">
              <input
                type="number"
                value={studyParams.desiredAccuracy}
                onChange={(e) => setStudyParams(prev => ({ ...prev, desiredAccuracy: parseFloat(e.target.value) || 5 }))}
                className={inputBase}
              />
            </Field>

            <Field label="Confidence level (K)">
              <select
                value={studyParams.confidenceLevel}
                onChange={(e) => setStudyParams(prev => ({ ...prev, confidenceLevel: parseFloat(e.target.value) }))}
                className={inputBase}
              >
                <option value={1.96}>1.96 (95%)</option>
                <option value={2}>2.00 (95%)</option>
                <option value={2.58}>2.58 (99%)</option>
              </select>
            </Field>

            <Field label="Preliminary P">
              <input
                type="number"
                step="0.01"
                value={studyParams.preliminaryP.toFixed(3)}
                readOnly
                className={`${inputBase} bg-line/40`}
              />
            </Field>

            <Field label="Required observations (N)">
              <input
                type="number"
                value={studyParams.requiredObservations}
                readOnly
                className={`${inputBase} bg-line/40 font-semibold text-pes-700`}
              />
            </Field>
          </div>

          <div className="mt-4 p-4 bg-pes-50 rounded-lg text-sm text-body">
            <strong className="text-strong">Formula:</strong> N = K²P(1-P) / A²P² where P = {studyParams.preliminaryP.toFixed(3)},
            A = {studyParams.desiredAccuracy}%, K = {studyParams.confidenceLevel}
          </div>
        </Section>

        {/* Schedule Generation */}
        <Section icon={Calendar} title="Observation schedule generator">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <Field label="Work start time (24hr)">
              <input type="number" value={scheduleParams.workStartTime}
                onChange={(e) => setScheduleParams(prev => ({ ...prev, workStartTime: parseInt(e.target.value) || 8 }))}
                className={inputBase} />
            </Field>
            <Field label="Min cycle duration (min)">
              <input type="number" value={scheduleParams.minimumCycleDuration}
                onChange={(e) => setScheduleParams(prev => ({ ...prev, minimumCycleDuration: parseInt(e.target.value) || 30 }))}
                className={inputBase} />
            </Field>
            <Field label="Observations / day">
              <input type="number" value={scheduleParams.observationsPerDay}
                onChange={(e) => setScheduleParams(prev => ({ ...prev, observationsPerDay: parseInt(e.target.value) || 10 }))}
                className={inputBase} />
            </Field>
            <Field label="Working minutes / day">
              <input type="number" value={scheduleParams.workingMinutesPerDay}
                onChange={(e) => setScheduleParams(prev => ({ ...prev, workingMinutesPerDay: parseInt(e.target.value) || 480 }))}
                className={inputBase} />
            </Field>
          </div>

          <Button onClick={generateObservationSchedule} variant="primary" size="sm" className="mb-4">
            <Clock className="w-4 h-4" /> Generate schedule
          </Button>

          {generatedSchedule.length > 0 && (
            <div className="border border-line rounded-lg p-4">
              <h3 className="font-semibold text-strong mb-3">Generated observation times</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {generatedSchedule.map((time, index) => (
                  <div key={index} className="bg-pes-50 text-pes-700 px-3 py-1 rounded-md text-center font-mono text-sm tabular-nums">
                    {time}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-muted">
                <strong className="text-body">Random numbers used:</strong> {randomNumbers.map(r => r.toFixed(3)).join(', ')}
              </div>
            </div>
          )}
        </Section>

        {/* Positions */}
        <Section
          icon={BarChart3}
          title="Position observations"
          action={
            <Button onClick={addPosition} variant="subtle" size="sm">
              <Plus className="w-4 h-4" /> Add position
            </Button>
          }
        >
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="bg-canvas border border-line rounded-lg p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="xl:col-span-4">
                    <input
                      type="text"
                      value={position.name}
                      onChange={(e) => updatePosition(position.id, 'name', e.target.value)}
                      className={`${inputBase} font-semibold`}
                      placeholder="Position name"
                    />
                  </div>

                  <Field label="Busy observations">
                    <input type="number" value={position.busyObservations}
                      onChange={(e) => updatePosition(position.id, 'busyObservations', parseInt(e.target.value) || 0)}
                      className={inputBase} />
                  </Field>
                  <Field label="Not busy observations">
                    <input type="number" value={position.notBusyObservations}
                      onChange={(e) => updatePosition(position.id, 'notBusyObservations', parseInt(e.target.value) || 0)}
                      className={inputBase} />
                  </Field>
                  <Field label="Performance rating (%)">
                    <input type="number" value={position.performanceRating}
                      onChange={(e) => updatePosition(position.id, 'performanceRating', parseInt(e.target.value) || 100)}
                      className={inputBase} />
                  </Field>
                  <Field label="Allowance (%)">
                    <input type="number" value={position.allowancePercentage}
                      onChange={(e) => updatePosition(position.id, 'allowancePercentage', parseInt(e.target.value) || 10)}
                      className={inputBase} />
                  </Field>

                  <div className="xl:col-span-4 flex items-center justify-between bg-surface border border-line rounded-lg p-3">
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div className="text-center">
                        <div className="text-xs text-muted">Total observations</div>
                        <div className="text-lg font-semibold text-strong tabular-nums">{position.totalObservations}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted">Utilization factor</div>
                        <div className="text-lg font-semibold text-pes-700 tabular-nums">
                          {(position.utilizationFactor * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted">Annual standard hours</div>
                        <div className="text-lg font-semibold text-success-700 tabular-nums">
                          {(position.utilizationFactor * position.annualWorkingHours * (position.performanceRating / 100) * (1 + position.allowancePercentage / 100)).toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removePosition(position.id)}
                      aria-label={`Remove ${position.name}`}
                      className="text-muted hover:text-danger-600 p-2 rounded-md hover:bg-danger-50 transition-colors ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Use Factor */}
        <Section icon={Users} title="Use factor configuration">
          <div className="max-w-md">
            <Field label="Use factor (proportion of time on paid job)">
              <input
                type="number" step="0.01" min="0" max="1" value={useFactor}
                onChange={(e) => setUseFactor(parseFloat(e.target.value) || 0.85)}
                className={inputBase}
              />
            </Field>
            <div className="text-sm text-muted mt-2">
              Accounts for legitimate non-work time (meetings, breaks, sick leave, etc.)
            </div>
          </div>
        </Section>

        {/* Results */}
        <section className="bg-surface border border-line rounded-xl shadow-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-strong mb-6 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-pes-700" />
            Work sampling results
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {resultCards.map((c) => (
              <div key={c.label} className="rounded-lg border border-line bg-canvas p-5">
                <div className="text-sm text-muted mb-1.5">{c.label}</div>
                <div className="text-2xl font-semibold text-pes-700 tabular-nums">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-line p-5">
            <h3 className="text-base font-semibold text-strong mb-3">Calculation summary</h3>
            <div className="space-y-2 text-sm text-body">
              <div><strong className="text-strong">Study parameters:</strong> {studyParams.requiredObservations} observations needed for {studyParams.desiredAccuracy}% accuracy at {(studyParams.confidenceLevel === 2 ? 95 : studyParams.confidenceLevel === 1.96 ? 95 : 99)}% confidence</div>
              <div><strong className="text-strong">Total positions analyzed:</strong> {positions.length}</div>
              <div><strong className="text-strong">Use factor applied:</strong> {(useFactor * 100).toFixed(0)}% (accounts for legitimate non-productive time)</div>
              <div><strong className="text-strong">Staffing formula:</strong> Required staff = Total annual standard hours ÷ (Annual working hours × Use factor)</div>
              <div><strong className="text-strong">Final recommendation:</strong> {results.requiredStaffPositions} staff positions needed to handle the workload effectively</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorkSamplingTool;
