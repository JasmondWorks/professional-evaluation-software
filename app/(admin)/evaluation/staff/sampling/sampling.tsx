import React, { useState, useEffect } from 'react';
import { Eye, Target, Calendar, Clock, BarChart3, Plus, Trash2, Users, Calculator } from 'lucide-react';

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

interface ScheduleEntry {
  day: number;
  month: number;
  times: string[];
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Work Sampling Analysis Tool</h1>
            </div>
            <p className="text-indigo-100 text-lg">Statistical Approach to Workforce Planning & Utilization Analysis</p>
          </div>

          <div className="p-8">
            {/* Study Parameters Section */}
            <div className="mb-8 bg-blue-50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Study Parameters
              </h2>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Accuracy (A %)
                  </label>
                  <input
                    type="number"
                    value={studyParams.desiredAccuracy}
                    onChange={(e) => setStudyParams(prev => ({
                      ...prev,
                      desiredAccuracy: parseFloat(e.target.value) || 5
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Level (K)
                  </label>
                  <select
                    value={studyParams.confidenceLevel}
                    onChange={(e) => setStudyParams(prev => ({
                      ...prev,
                      confidenceLevel: parseFloat(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1.96}>1.96 (95%)</option>
                    <option value={2}>2.00 (95%)</option>
                    <option value={2.58}>2.58 (99%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preliminary P
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={studyParams.preliminaryP.toFixed(3)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Observations (N)
                  </label>
                  <input
                    type="number"
                    value={studyParams.requiredObservations}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-blue-500">
                <div className="text-sm text-gray-700">
                  <strong>Formula:</strong> N = K²P(1-P) / A²P² where P = {studyParams.preliminaryP.toFixed(3)}, 
                  A = {studyParams.desiredAccuracy}%, K = {studyParams.confidenceLevel}
                </div>
              </div>
            </div>

            {/* Schedule Generation Section */}
            <div className="mb-8 bg-green-50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                Observation Schedule Generator
              </h2>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Start Time (24hr)
                  </label>
                  <input
                    type="number"
                    value={scheduleParams.workStartTime}
                    onChange={(e) => setScheduleParams(prev => ({
                      ...prev,
                      workStartTime: parseInt(e.target.value) || 8
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Cycle Duration (min)
                  </label>
                  <input
                    type="number"
                    value={scheduleParams.minimumCycleDuration}
                    onChange={(e) => setScheduleParams(prev => ({
                      ...prev,
                      minimumCycleDuration: parseInt(e.target.value) || 30
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observations/Day
                  </label>
                  <input
                    type="number"
                    value={scheduleParams.observationsPerDay}
                    onChange={(e) => setScheduleParams(prev => ({
                      ...prev,
                      observationsPerDay: parseInt(e.target.value) || 10
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Minutes/Day
                  </label>
                  <input
                    type="number"
                    value={scheduleParams.workingMinutesPerDay}
                    onChange={(e) => setScheduleParams(prev => ({
                      ...prev,
                      workingMinutesPerDay: parseInt(e.target.value) || 480
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <button
                  onClick={generateObservationSchedule}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Generate Schedule
                </button>
              </div>

              {generatedSchedule.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Generated Observation Times</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {generatedSchedule.map((time, index) => (
                      <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded text-center font-mono">
                        {time}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Random Numbers Used:</strong> {randomNumbers.map(r => r.toFixed(3)).join(', ')}
                  </div>
                </div>
              )}
            </div>

            {/* Positions Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  Position Observations
                </h2>
                <button
                  onClick={addPosition}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Position
                </button>
              </div>

              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="xl:col-span-4">
                        <input
                          type="text"
                          value={position.name}
                          onChange={(e) => updatePosition(position.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold"
                          placeholder="Position name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Busy Observations
                        </label>
                        <input
                          type="number"
                          value={position.busyObservations}
                          onChange={(e) => updatePosition(position.id, 'busyObservations', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Not Busy Observations
                        </label>
                        <input
                          type="number"
                          value={position.notBusyObservations}
                          onChange={(e) => updatePosition(position.id, 'notBusyObservations', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Performance Rating (%)
                        </label>
                        <input
                          type="number"
                          value={position.performanceRating}
                          onChange={(e) => updatePosition(position.id, 'performanceRating', parseInt(e.target.value) || 100)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Allowance (%)
                        </label>
                        <input
                          type="number"
                          value={position.allowancePercentage}
                          onChange={(e) => updatePosition(position.id, 'allowancePercentage', parseInt(e.target.value) || 10)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="xl:col-span-4 flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-4 flex-1">
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Total Observations</div>
                            <div className="text-lg font-bold text-gray-800">{position.totalObservations}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Utilization Factor</div>
                            <div className="text-lg font-bold text-purple-600">
                              {(position.utilizationFactor * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">Annual Standard Hours</div>
                            <div className="text-lg font-bold text-green-600">
                              {(position.utilizationFactor * position.annualWorkingHours * (position.performanceRating / 100) * (1 + position.allowancePercentage / 100)).toFixed(0)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removePosition(position.id)}
                          className="text-red-500 hover:text-red-700 p-2 transition-colors ml-4"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Factor Section */}
            <div className="mb-8 bg-orange-50 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-orange-600" />
                Use Factor Configuration
              </h2>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use Factor (Proportion of time on paid job)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={useFactor}
                  onChange={(e) => setUseFactor(parseFloat(e.target.value) || 0.85)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="text-sm text-gray-600 mt-2">
                  Accounts for legitimate non-work time (meetings, breaks, sick leave, etc.)
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-2">
                <Calculator className="w-8 h-8" />
                Work Sampling Results
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                  <div className="text-sm font-medium text-gray-600 mb-2">Average Utilization</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(results.totalUtilization * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                  <div className="text-sm font-medium text-gray-600 mb-2">Total Annual Standard Hours</div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.totalAnnualStandardHours.toFixed(0)}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                  <div className="text-sm font-medium text-gray-600 mb-2">Required Staff Positions</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {results.requiredStaffPositions}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
                  <div className="text-sm font-medium text-gray-600 mb-2">Average Performance</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {results.averagePerformance.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Calculation Summary</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong>Study Parameters:</strong> {studyParams.requiredObservations} observations needed for {studyParams.desiredAccuracy}% accuracy at {(studyParams.confidenceLevel === 2 ? 95 : studyParams.confidenceLevel === 1.96 ? 95 : 99)}% confidence</div>
                  <div><strong>Total Positions Analyzed:</strong> {positions.length}</div>
                  <div><strong>Use Factor Applied:</strong> {(useFactor * 100).toFixed(0)}% (accounts for legitimate non-productive time)</div>
                  <div><strong>Staffing Formula:</strong> Required Staff = Total Annual Standard Hours ÷ (Annual Working Hours × Use Factor)</div>
                  <div><strong>Final Recommendation:</strong> {results.requiredStaffPositions} staff positions needed to handle the workload effectively</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkSamplingTool;