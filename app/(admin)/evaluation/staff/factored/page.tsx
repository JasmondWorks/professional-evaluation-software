'use client';

import React, { useState, useEffect } from 'react';
import LoadingButton from '../../../../components/ui/LoadingButton';
import { useAuth } from "@/app/components/useAuth";

interface Task {
  id: number;
  name: string;
  observedTime: number;
  estimatedTime: number;
  correctionFactor: number;
}

interface EstimateCalculation {
  originalEstimate: number;
  correctedEstimate: number;
  basicTime: number;
  standardTime: number;
  performanceRating: number;
  allowancePercentage: number;
}

export default function FactoredEstimatingPage() {
  const { role } = useAuth();
  const [availableHours, setAvailableHours] = useState<number | ''>('');
  const [useFactor, setUseFactor] = useState<number | ''>('');
  const [calculatedStaff, setCalculatedStaff] = useState<number | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);

  const handleCalculateStaff = (e: React.MouseEvent) => {
    e.preventDefault();
    setStaffError(null);
    if (!availableHours || Number(availableHours) <= 0 || !useFactor || Number(useFactor) <= 0) {
      setStaffError("⚠️ Available hours and Use factor must be greater than zero.");
      return;
    }
    const staff = estimation.standardTime / (Number(availableHours) * Number(useFactor));
    setCalculatedStaff(staff);
  };

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: 'Write cleaners pay voucher', observedTime: 0.6, estimatedTime: 0.75, correctionFactor: 0 },
    { id: 2, name: 'Write permanent junior staff voucher', observedTime: 1.3, estimatedTime: 1.6, correctionFactor: 0 },
    { id: 3, name: 'Write senior staff voucher', observedTime: 1.2, estimatedTime: 1.3, correctionFactor: 0 },
    { id: 4, name: 'Write car maintenance pay voucher', observedTime: 0.03, estimatedTime: 0.04, correctionFactor: 0 }
  ]);

  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskObserved, setNewTaskObserved] = useState('');
  const [newTaskEstimated, setNewTaskEstimated] = useState('');
  const [taskError, setTaskError] = useState('');
  
  const [estimation, setEstimation] = useState<EstimateCalculation>({
    originalEstimate: 1.8,
    correctedEstimate: 0,
    basicTime: 0,
    standardTime: 0,
    performanceRating: 125,
    allowancePercentage: 9
  });

  const [averageCorrectionFactor, setAverageCorrectionFactor] = useState(0);

  // Calculate correction factors and average
  useEffect(() => {
    const updatedTasks = tasks.map(task => ({
      ...task,
      correctionFactor: (task.observedTime - task.estimatedTime) / task.observedTime
    }));
    
    setTasks(updatedTasks);
    
    const avgCF = updatedTasks.reduce((sum, task) => sum + task.correctionFactor, 0) / updatedTasks.length;
    setAverageCorrectionFactor(avgCF);
  }, [tasks.length]);

  // Calculate final estimation
  useEffect(() => {
    const correctedEstimate = estimation.originalEstimate * (1 + averageCorrectionFactor);
    const basicTime = correctedEstimate * (estimation.performanceRating / 100);
    const standardTime = basicTime + (estimation.allowancePercentage / 100) * basicTime;
    
    setEstimation(prev => ({
      ...prev,
      correctedEstimate,
      basicTime,
      standardTime
    }));
  }, [estimation.originalEstimate, estimation.performanceRating, estimation.allowancePercentage, averageCorrectionFactor]);

  const addTask = () => {
    if (newTaskName && newTaskObserved && newTaskEstimated) {
      const newTask: Task = {
        id: Date.now(),
        name: newTaskName,
        observedTime: parseFloat(newTaskObserved),
        estimatedTime: parseFloat(newTaskEstimated),
        correctionFactor: 0
      };
      
      setTasks([...tasks, newTask]);
      setNewTaskName('');
      setNewTaskObserved('');
      setNewTaskEstimated('');
      setTaskError('');
    } else {
      setTaskError('Please provide a name, observed time, and estimated time.');
    }
  };



  const removeTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id: number, field: keyof Task, value: string | number) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, [field]: value };
        if (field === 'observedTime' || field === 'estimatedTime') {
          updatedTask.correctionFactor = updatedTask.estimatedTime !== 0 ? 
            (updatedTask.observedTime - updatedTask.estimatedTime) / updatedTask.estimatedTime : 0;
        }
        return updatedTask;
      }
      return task;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pes-50 to-pes-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-1">
          <h1 className="text-4xl font-bold text-strong mb-4">
            Factored Estimating Calculator
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Historical Tasks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-strong">Historical Task Data</h2>
              <p className="text-sm text-body">
                Enter observed and estimated times to calculate correction factors
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Add New Task */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Add New Task</h4>
                <div className="grid gap-2">
                  <input
                    type="text"
                    placeholder="Task name"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Observed (hrs)"
                      value={newTaskObserved}
                      onChange={(e) => setNewTaskObserved(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Estimated (hrs)"
                      value={newTaskEstimated}
                      onChange={(e) => setNewTaskEstimated(e.target.value)}
                      className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
                    />
                  </div>
                  {taskError && (
                    <p className="text-danger-600 text-sm mt-1">{taskError}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <LoadingButton className="bg-pes w-fit my-3 rounded text-white px-12 py-3" onClick={addTask}>
                      Add task
                    </LoadingButton>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="border rounded p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 border border-line rounded text-sm focus:outline-none focus:shadow-focus"
                      />
                      <button
                        onClick={() => removeTask(task.id)}
                        className="ml-2 p-1 text-danger-600 hover:bg-danger-50 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Observed</label>
                        <input
                          type="number"
                          step="0.01"
                          value={task.observedTime}
                          onChange={(e) => updateTask(task.id, 'observedTime', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-line rounded text-sm focus:outline-none focus:shadow-focus"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Estimated</label>
                        <input
                          type="number"
                          step="0.01"
                          value={task.estimatedTime}
                          onChange={(e) => updateTask(task.id, 'estimatedTime', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-line rounded text-sm focus:outline-none focus:shadow-focus"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">CF</label>
                        <div className="p-2 bg-canvas rounded text-center font-mono text-sm">
                          {(task.correctionFactor * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}


              </div>

              {/* Average Correction Factor */}
              <div className="bg-pes-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Average Correction Factor</h4>
                <div className="text-2xl font-bold text-pes-600">
                  {(averageCorrectionFactor * 100).toFixed(2)}%
                </div>
                <p className="text-sm text-body mt-1">
                  {averageCorrectionFactor < 0 ? 'Tendency to overestimate' : 'Tendency to underestimate'}
                </p>
              </div>
            </div>
          </div>

          {/* Estimation Calculator */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-strong">New Task Estimation</h2>
              <p className="text-sm text-body">
                Apply correction factors to estimate a new task
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Input Parameters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-body mb-1">Original Estimate (hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={estimation.originalEstimate}
                    onChange={(e) => setEstimation(prev => ({
                      ...prev,
                      originalEstimate: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">Performance Rating (%)</label>
                  <input
                    type="number"
                    value={estimation.performanceRating}
                    onChange={(e) => setEstimation(prev => ({
                      ...prev,
                      performanceRating: parseFloat(e.target.value) || 100
                    }))}
                    className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
                  />
                  <p className="text-xs text-muted mt-1">
                    100% = standard performance, &gt;100% = above standard
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-body mb-1">Allowance (%)</label>
                  <input
                    type="number"
                    value={estimation.allowancePercentage}
                    onChange={(e) => setEstimation(prev => ({
                      ...prev,
                      allowancePercentage: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes"
                  />
                  <p className="text-xs text-muted mt-1">
                    For breaks, fatigue, delays, etc.
                  </p>
                </div>
              </div>

              {/* Calculation Steps */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-semibold">Calculation Steps</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-canvas rounded">
                    <span>1. Original Estimate:</span>
                    <span className="font-mono">{estimation.originalEstimate.toFixed(3)} hrs</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-canvas rounded">
                    <span>2. Corrected Estimate:</span>
                    <span className="font-mono">{estimation.correctedEstimate.toFixed(3)} hrs</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-canvas rounded">
                    <span>3. Basic Time:</span>
                    <span className="font-mono">{estimation.basicTime.toFixed(3)} hrs</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                    <span className="font-semibold">4. Standard Time:</span>
                    <span className="font-mono font-bold text-green-700">
                      {estimation.standardTime.toFixed(3)} hrs
                    </span>
                  </div>
                </div>

                {/* Formula Details */}
                <div className="bg-pes-50 p-3 rounded text-xs font-mono space-y-1">
                  <div>Corrected = {estimation.originalEstimate} × (1 + {(averageCorrectionFactor).toFixed(3)})</div>
                  <div>Basic = {estimation.correctedEstimate.toFixed(3)} × ({estimation.performanceRating}/100)</div>
                  <div>Standard = {estimation.basicTime.toFixed(3)} + ({estimation.allowancePercentage}% × {estimation.basicTime.toFixed(3)})</div>
                  <div className="mt-2 pt-2 border-t border-blue-200">Total Staff = Standard / (Available Hours × Use Factor)</div>
                </div>

                {/* Staff Determination Section */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-strong text-sm">Staff Determination</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-body mb-1">Available Hours</label>
                      <input
                        type="number"
                        placeholder="e.g. 2080"
                        value={availableHours}
                        onChange={(e) => setAvailableHours(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-body mb-1">Use Factor</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 0.85"
                        value={useFactor}
                        onChange={(e) => setUseFactor(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-pes text-sm"
                      />
                    </div>
                  </div>

                  {(role === 'super-admin' || role === 'admin') ? (
                    <div className="space-y-3">
                      <LoadingButton
                        className="bg-pes w-full rounded text-white py-2.5 text-sm font-medium hover:opacity-90 transition-all"
                        onClick={handleCalculateStaff}
                      >
                        Calculate Number of Staff
                      </LoadingButton>

                      {staffError && (
                        <p className="text-danger-600 text-xs font-medium">{staffError}</p>
                      )}

                      {calculatedStaff !== null && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 font-semibold text-sm">
                          Recommended number of staff: <span className="font-mono font-bold text-base text-pes underline">{calculatedStaff.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-warning-600 bg-warning-50 p-2.5 rounded border border-warning-100">
                      Only administrators are authorized to calculate the final number of staff.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-strong mb-4">Key Benefits of Factored Estimating</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-pes-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-pes-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Improved Accuracy</h3>
              <p className="text-sm text-body">
                Identifies and corrects systematic estimation biases using historical data
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Performance Adjustment</h3>
              <p className="text-sm text-body">
                Accounts for individual performance variations and skill levels
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Realistic Standards</h3>
              <p className="text-sm text-body">
                Includes necessary allowances for breaks, fatigue, and delays
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}