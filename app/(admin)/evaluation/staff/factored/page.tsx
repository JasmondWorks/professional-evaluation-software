'use client';

// Factored estimating: correct a new estimate using the bias measured across
// historical tasks, then convert the standard time into a staff requirement.

import React, { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/app/components/useAuth';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  PageHeader,
  inputBase,
} from '@/app/components/ui';

interface Task {
  id: number;
  name: string;
  observedTime: number;
  estimatedTime: number;
}

// The worked example from the estimating guide — loaded on request so the page
// never presents sample rows as this organization's own history.
const EXAMPLE_TASKS: Task[] = [
  { id: 1, name: 'Write cleaners pay voucher', observedTime: 0.6, estimatedTime: 0.75 },
  { id: 2, name: 'Write permanent junior staff voucher', observedTime: 1.3, estimatedTime: 1.6 },
  { id: 3, name: 'Write senior staff voucher', observedTime: 1.2, estimatedTime: 1.3 },
  { id: 4, name: 'Write car maintenance pay voucher', observedTime: 0.03, estimatedTime: 0.04 },
];

// Correction factor for one task, relative to the time actually observed.
const correctionFactor = (t: Task) =>
  t.observedTime === 0 ? 0 : (t.observedTime - t.estimatedTime) / t.observedTime;

export default function FactoredEstimatingPage() {
  const { role } = useAuth();
  const canEvaluate = role === 'super-admin' || role === 'admin';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskObserved, setNewTaskObserved] = useState('');
  const [newTaskEstimated, setNewTaskEstimated] = useState('');
  const [taskError, setTaskError] = useState('');

  const [originalEstimate, setOriginalEstimate] = useState(1.8);
  const [performanceRating, setPerformanceRating] = useState(125);
  const [allowancePercentage, setAllowancePercentage] = useState(9);

  const [availableHours, setAvailableHours] = useState<number | ''>('');
  const [useFactor, setUseFactor] = useState<number | ''>('');
  const [calculatedStaff, setCalculatedStaff] = useState<number | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Everything below is derived — no effect loops, so an edit can never leave a
  // stale correction factor on screen.
  const averageCorrectionFactor = useMemo(() => {
    if (tasks.length === 0) return 0;
    return tasks.reduce((sum, t) => sum + correctionFactor(t), 0) / tasks.length;
  }, [tasks]);

  const { correctedEstimate, basicTime, standardTime } = useMemo(() => {
    const corrected = originalEstimate * (1 + averageCorrectionFactor);
    const basic = corrected * (performanceRating / 100);
    return {
      correctedEstimate: corrected,
      basicTime: basic,
      standardTime: basic + (allowancePercentage / 100) * basic,
    };
  }, [originalEstimate, performanceRating, allowancePercentage, averageCorrectionFactor]);

  function addTask() {
    const observed = parseFloat(newTaskObserved);
    const estimated = parseFloat(newTaskEstimated);

    if (!newTaskName.trim() || Number.isNaN(observed) || Number.isNaN(estimated)) {
      setTaskError('Enter a task name, an observed time and an estimated time.');
      return;
    }
    if (observed <= 0) {
      setTaskError('Observed time must be greater than zero — it divides the correction factor.');
      return;
    }

    setTasks((prev) => [
      ...prev,
      { id: Date.now(), name: newTaskName.trim(), observedTime: observed, estimatedTime: estimated },
    ]);
    setNewTaskName('');
    setNewTaskObserved('');
    setNewTaskEstimated('');
    setTaskError('');
  }

  function updateTask(id: number, field: keyof Task, value: string | number) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, [field]: value } : task)),
    );
  }

  const removeTask = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));

  function handleCalculateStaff(e: React.MouseEvent) {
    e.preventDefault();
    setStaffError(null);
    if (!availableHours || Number(availableHours) <= 0 || !useFactor || Number(useFactor) <= 0) {
      setStaffError('Available hours and use factor must both be greater than zero.');
      setCalculatedStaff(null);
      return;
    }
    setCalculatedStaff(standardTime / (Number(availableHours) * Number(useFactor)));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Factored estimating"
        subtitle="Measure the bias in past estimates, apply it to a new one, and convert the standard time into a staff requirement."
      />

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* Historical task data */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-strong">Historical task data</h2>
            <p className="text-sm text-muted mt-1">
              Observed against estimated time for tasks already completed. Each row&apos;s
              correction factor is (observed − estimated) ÷ observed.
            </p>
          </CardHeader>

          <CardBody className="flex flex-col gap-5">
            <div className="rounded-lg border border-line bg-canvas p-4 flex flex-col gap-3">
              <h3 className="text-sm font-medium text-strong">Add a task</h3>
              <input
                type="text"
                aria-label="Task name"
                placeholder="Task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className={inputBase}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  aria-label="Observed time in hours"
                  placeholder="Observed (hrs)"
                  value={newTaskObserved}
                  onChange={(e) => setNewTaskObserved(e.target.value)}
                  className={inputBase}
                />
                <input
                  type="number"
                  step="0.01"
                  aria-label="Estimated time in hours"
                  placeholder="Estimated (hrs)"
                  value={newTaskEstimated}
                  onChange={(e) => setNewTaskEstimated(e.target.value)}
                  className={inputBase}
                />
              </div>
              {taskError && (
                <Alert tone="danger" className="text-sm">
                  {taskError}
                </Alert>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={addTask}>
                  Add task
                </Button>
                {tasks.length === 0 && (
                  <Button size="sm" variant="secondary" onClick={() => setTasks(EXAMPLE_TASKS)}>
                    Load worked example
                  </Button>
                )}
              </div>
            </div>

            {tasks.length === 0 ? (
              <Empty
                title="No historical tasks yet"
                description="Add the tasks your estimates were measured against — the average correction factor comes from them."
                className="py-8"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-line p-3 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="text"
                        aria-label="Task name"
                        value={task.name}
                        onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                        className={inputBase}
                      />
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        aria-label={`Remove ${task.name}`}
                        className="p-2 rounded-lg text-muted hover:text-danger-700 hover:bg-danger-50 transition-colors focus-visible:outline-none focus-visible:shadow-focus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex flex-col">
                        <span className="text-xs font-medium text-muted mb-1">Observed</span>
                        <input
                          type="number"
                          step="0.01"
                          value={task.observedTime}
                          onChange={(e) =>
                            updateTask(task.id, 'observedTime', parseFloat(e.target.value) || 0)
                          }
                          className={inputBase}
                        />
                      </label>
                      <label className="flex flex-col">
                        <span className="text-xs font-medium text-muted mb-1">Estimated</span>
                        <input
                          type="number"
                          step="0.01"
                          value={task.estimatedTime}
                          onChange={(e) =>
                            updateTask(task.id, 'estimatedTime', parseFloat(e.target.value) || 0)
                          }
                          className={inputBase}
                        />
                      </label>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-muted mb-1">
                          Correction factor
                        </span>
                        <div className="h-9 grid place-items-center rounded-lg bg-canvas border border-line text-sm tabular-nums text-strong">
                          {(correctionFactor(task) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-pes-50 border border-pes-100 p-4">
              <p className="text-sm font-medium text-pes-700">Average correction factor</p>
              <p className="text-3xl font-semibold text-pes-700 tabular-nums mt-1">
                {(averageCorrectionFactor * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-pes-700/80 mt-1">
                {tasks.length === 0
                  ? 'Add historical tasks to measure the estimating bias.'
                  : averageCorrectionFactor < 0
                    ? 'Estimates have tended to run over the observed time.'
                    : 'Estimates have tended to run under the observed time.'}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* New task estimation */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-strong">New task estimation</h2>
            <p className="text-sm text-muted mt-1">
              Apply the measured correction factor to a fresh estimate.
            </p>
          </CardHeader>

          <CardBody className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-body mb-1.5">
                  Original estimate (hours)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={originalEstimate}
                  onChange={(e) => setOriginalEstimate(parseFloat(e.target.value) || 0)}
                  className={inputBase}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-body mb-1.5">
                  Performance rating (%)
                </span>
                <input
                  type="number"
                  value={performanceRating}
                  onChange={(e) => setPerformanceRating(parseFloat(e.target.value) || 100)}
                  className={inputBase}
                />
                <span className="text-xs text-muted mt-1">
                  100% is standard performance; above 100% is faster than standard.
                </span>
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-body mb-1.5">Allowance (%)</span>
                <input
                  type="number"
                  value={allowancePercentage}
                  onChange={(e) => setAllowancePercentage(parseFloat(e.target.value) || 0)}
                  className={inputBase}
                />
                <span className="text-xs text-muted mt-1">
                  Covers breaks, fatigue and unavoidable delays.
                </span>
              </label>
            </div>

            <div className="border-t border-line pt-5">
              <h3 className="text-sm font-medium text-strong mb-3">Calculation steps</h3>
              <dl className="flex flex-col gap-1.5 text-sm">
                {[
                  ['1. Original estimate', originalEstimate],
                  ['2. Corrected estimate', correctedEstimate],
                  ['3. Basic time', basicTime],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="flex justify-between items-center rounded-lg bg-canvas px-3 py-2"
                  >
                    <dt className="text-body">{label as string}</dt>
                    <dd className="tabular-nums text-strong">
                      {(value as number).toFixed(3)} hrs
                    </dd>
                  </div>
                ))}
                <div className="flex justify-between items-center rounded-lg bg-pes-50 border border-pes-100 px-3 py-2">
                  <dt className="font-medium text-pes-700">4. Standard time</dt>
                  <dd className="tabular-nums font-semibold text-pes-700">
                    {standardTime.toFixed(3)} hrs
                  </dd>
                </div>
              </dl>

              <div className="mt-3 rounded-lg border border-line bg-canvas p-3 text-xs font-mono text-body flex flex-col gap-1 overflow-x-auto">
                <span>
                  Corrected = {originalEstimate} × (1 + {averageCorrectionFactor.toFixed(3)})
                </span>
                <span>
                  Basic = {correctedEstimate.toFixed(3)} × ({performanceRating} / 100)
                </span>
                <span>
                  Standard = {basicTime.toFixed(3)} + ({allowancePercentage}% ×{' '}
                  {basicTime.toFixed(3)})
                </span>
                <span className="pt-1 mt-1 border-t border-line">
                  Staff = Standard ÷ (Available hours × Use factor)
                </span>
              </div>
            </div>

            <div className="border-t border-line pt-5 flex flex-col gap-4">
              <h3 className="text-sm font-medium text-strong">Staff determination</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col">
                  <span className="text-xs font-medium text-muted mb-1">Available hours</span>
                  <input
                    type="number"
                    placeholder="e.g. 2080"
                    value={availableHours}
                    onChange={(e) =>
                      setAvailableHours(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className={inputBase}
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-xs font-medium text-muted mb-1">Use factor</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 0.85"
                    value={useFactor}
                    onChange={(e) =>
                      setUseFactor(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className={inputBase}
                  />
                </label>
              </div>

              {canEvaluate ? (
                <>
                  <Button onClick={handleCalculateStaff}>Calculate number of staff</Button>

                  {staffError && (
                    <Alert tone="danger" role="alert">
                      {staffError}
                    </Alert>
                  )}

                  {calculatedStaff !== null && (
                    <div className="rounded-xl bg-success-50 border border-success-100 p-4">
                      <p className="text-sm text-success-700">
                        Number of staff required for this workload
                      </p>
                      <p className="text-3xl font-semibold text-success-700 tabular-nums mt-1">
                        {calculatedStaff.toFixed(2)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <Alert tone="warning">
                  Only administrators are authorized to calculate the final number of staff.
                </Alert>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
