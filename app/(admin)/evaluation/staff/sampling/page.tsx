'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BarChart3, Calculator, FileText, Plus, Trash2, Save, Download } from 'lucide-react';

interface Position {
  id: string;
  name: string;
  department: string;
}

interface Observation {
  id: string;
  positionId: string;
  date: string;
  time: string;
  isBusy: boolean;
  performanceRating: number;
  notes?: string;
}

interface StudyParameters {
  desiredAccuracy: number;
  confidenceLevel: number;
  preliminaryP: number;
  totalObservations: number;
}

interface AnalysisResult {
  positionId: string;
  positionName: string;
  utilizationFactor: number;
  busyCount: number;
  totalObservations: number;
  avgPerformanceRating: number;
  estimatedAnnualHours: number;
}

const WorkSamplingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'parameters' | 'observations' | 'analysis'>('positions');
  const [positions, setPositions] = useState<Position[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [studyParameters, setStudyParameters] = useState<StudyParameters>({
    desiredAccuracy: 5,
    confidenceLevel: 95,
    preliminaryP: 0.5,
    totalObservations: 0
  });
  
  const [newPosition, setNewPosition] = useState({ name: '', department: '' });
  const [newObservation, setNewObservation] = useState({
    positionId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    isBusy: true,
    performanceRating: 100,
    notes: ''
  });

  // Calculate required observations based on parameters
  useEffect(() => {
    const { desiredAccuracy, confidenceLevel, preliminaryP } = studyParameters;
    const k = confidenceLevel === 95 ? 2 : confidenceLevel === 99 ? 2.58 : 1.96;
    const a = desiredAccuracy / 100;
    const p = preliminaryP;
    
    const n = Math.ceil((k * k * (1 - p)) / (a * a * p));
    
    setStudyParameters(prev => ({ ...prev, totalObservations: n }));
  }, [studyParameters.desiredAccuracy, studyParameters.confidenceLevel, studyParameters.preliminaryP]);

  // Add position
  const addPosition = () => {
    if (newPosition.name && newPosition.department) {
      const position: Position = {
        id: Date.now().toString(),
        name: newPosition.name,
        department: newPosition.department
      };
      setPositions([...positions, position]);
      setNewPosition({ name: '', department: '' });
    }
  };

  // Remove position
  const removePosition = (id: string) => {
    setPositions(positions.filter(pos => pos.id !== id));
    setObservations(observations.filter(obs => obs.positionId !== id));
  };

  // Add observation
  const addObservation = () => {
    if (newObservation.positionId) {
      const observation: Observation = {
        id: Date.now().toString(),
        ...newObservation
      };
      setObservations([...observations, observation]);
      setNewObservation(prev => ({ ...prev, notes: '' }));
    }
  };

  // Remove observation
  const removeObservation = (id: string) => {
    setObservations(observations.filter(obs => obs.id !== id));
  };

  // Generate random observation schedule
  const generateRandomSchedule = (observationsPerDay: number = 10) => {
    const schedules = [];
    const workStartHour = 8; // 8 AM
    const workDurationMinutes = 480; // 8 hours
    const minCycleDuration = 30; // 30 minutes minimum
    
    const maxDuration = Math.floor(workDurationMinutes / observationsPerDay);
    
    for (let i = 0; i < observationsPerDay; i++) {
      const randomFactor = Math.random();
      const observationMinute = Math.floor(minCycleDuration + (maxDuration - minCycleDuration) * randomFactor);
      const totalMinutes = workStartHour * 60 + (i * maxDuration) + observationMinute;
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      if (hours < 17) { // Before 5 PM
        schedules.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
    
    return schedules.sort();
  };

  // Calculate analysis results
  const calculateAnalysis = (): AnalysisResult[] => {
    return positions.map(position => {
      const positionObservations = observations.filter(obs => obs.positionId === position.id);
      const busyCount = positionObservations.filter(obs => obs.isBusy).length;
      const totalObs = positionObservations.length;
      const utilizationFactor = totalObs > 0 ? (busyCount / totalObs) * 100 : 0;
      const avgPerformanceRating = totalObs > 0 
        ? positionObservations.reduce((sum, obs) => sum + obs.performanceRating, 0) / totalObs 
        : 0;
      
      // Simplified estimation - in real implementation, you'd use actual work hours and allowances
      const estimatedAnnualHours = utilizationFactor * 2080 * (avgPerformanceRating / 100); // 2080 = standard work hours per year
      
      return {
        positionId: position.id,
        positionName: position.name,
        utilizationFactor,
        busyCount,
        totalObservations: totalObs,
        avgPerformanceRating,
        estimatedAnnualHours
      };
    });
  };

  const analysisResults = calculateAnalysis();
  const randomSchedule = generateRandomSchedule();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#322b80' }}>
            Work Sampling Analysis System
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive work measurement and staffing optimization platform
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-lg shadow-lg p-2">
          {[
            { key: 'positions', label: 'Positions', icon: Users },
            { key: 'parameters', label: 'Study Parameters', icon: Calculator },
            { key: 'observations', label: 'Observations', icon: Clock },
            { key: 'analysis', label: 'Analysis', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === key
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: activeTab === key ? '#322b80' : 'transparent'
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          
          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#322b80' }}>
                <Users className="inline mr-2" />
                Position Management
              </h2>
              
              {/* Add Position Form */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Position Name"
                  value={newPosition.name}
                  onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={newPosition.department}
                  onChange={(e) => setNewPosition({ ...newPosition, department: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
                <button
                  onClick={addPosition}
                  className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#322b80' }}
                >
                  <Plus size={20} />
                  Add Position
                </button>
              </div>

              {/* Positions List */}
              <div className="grid gap-4">
                {positions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No positions added yet. Add your first position above.</p>
                ) : (
                  positions.map(position => (
                    <div key={position.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h3 className="font-semibold text-lg">{position.name}</h3>
                        <p className="text-gray-600">{position.department}</p>
                      </div>
                      <button
                        onClick={() => removePosition(position.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Parameters Tab */}
          {activeTab === 'parameters' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#322b80' }}>
                <Calculator className="inline mr-2" />
                Study Parameters
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Accuracy (%)
                    </label>
                    <input
                      type="number"
                      value={studyParameters.desiredAccuracy}
                      onChange={(e) => setStudyParameters({ ...studyParameters, desiredAccuracy: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      min="1"
                      max="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confidence Level (%)
                    </label>
                    <select
                      value={studyParameters.confidenceLevel}
                      onChange={(e) => setStudyParameters({ ...studyParameters, confidenceLevel: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value={90}>90%</option>
                      <option value={95}>95%</option>
                      <option value={99}>99%</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preliminary P (Proportion Busy)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="0.99"
                      value={studyParameters.preliminaryP}
                      onChange={(e) => setStudyParameters({ ...studyParameters, preliminaryP: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Calculated Requirements</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Required Observations:</span>
                      <span className="font-semibold text-xl">{studyParameters.totalObservations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Study Duration:</span>
                      <span className="font-medium">{Math.ceil(studyParameters.totalObservations / 10)} days</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#322b80', color: 'white' }}>
                    <h4 className="font-semibold mb-2">Sample Schedule (10 obs/day)</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {randomSchedule.slice(0, 6).map((time, index) => (
                        <div key={index}>{time}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Observations Tab */}
          {activeTab === 'observations' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#322b80' }}>
                <Clock className="inline mr-2" />
                Data Collection
              </h2>
              
              {positions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Please add positions first before recording observations.</p>
                </div>
              ) : (
                <>
                  {/* Add Observation Form */}
                  <div className="grid md:grid-cols-6 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
                    <select
                      value={newObservation.positionId}
                      onChange={(e) => setNewObservation({ ...newObservation, positionId: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value="">Select Position</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>
                    
                    <input
                      type="date"
                      value={newObservation.date}
                      onChange={(e) => setNewObservation({ ...newObservation, date: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                    
                    <input
                      type="time"
                      value={newObservation.time}
                      onChange={(e) => setNewObservation({ ...newObservation, time: e.target.value })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                    
                    <select
                      value={newObservation.isBusy.toString()}
                      onChange={(e) => setNewObservation({ ...newObservation, isBusy: e.target.value === 'true' })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value="true">Busy</option>
                      <option value="false">Not Busy</option>
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Performance %"
                      value={newObservation.performanceRating}
                      onChange={(e) => setNewObservation({ ...newObservation, performanceRating: Number(e.target.value) })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      min="0"
                      max="200"
                    />
                    
                    <button
                      onClick={addObservation}
                      className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#322b80' }}
                    >
                      <Plus size={20} />
                      Add
                    </button>
                  </div>

                  {/* Observations List */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 rounded-lg">
                      <thead>
                        <tr style={{ backgroundColor: '#322b80', color: 'white' }}>
                          <th className="p-3 text-left">Position</th>
                          <th className="p-3 text-left">Date</th>
                          <th className="p-3 text-left">Time</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Performance</th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {observations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                              No observations recorded yet.
                            </td>
                          </tr>
                        ) : (
                          observations.map(obs => {
                            const position = positions.find(p => p.id === obs.positionId);
                            return (
                              <tr key={obs.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-3">{position?.name || 'Unknown'}</td>
                                <td className="p-3">{obs.date}</td>
                                <td className="p-3">{obs.time}</td>
                                <td className="p-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    obs.isBusy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {obs.isBusy ? 'Busy' : 'Not Busy'}
                                  </span>
                                </td>
                                <td className="p-3">{obs.performanceRating}%</td>
                                <td className="p-3">
                                  <button
                                    onClick={() => removeObservation(obs.id)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#322b80' }}>
                <BarChart3 className="inline mr-2" />
                Analysis Results
              </h2>
              
              {analysisResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No data available for analysis. Please add positions and observations first.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="p-6 rounded-lg text-white" style={{ backgroundColor: '#322b80' }}>
                      <h3 className="text-lg font-semibold mb-2">Total Positions</h3>
                      <p className="text-3xl font-bold">{positions.length}</p>
                    </div>
                    <div className="p-6 bg-green-500 rounded-lg text-white">
                      <h3 className="text-lg font-semibold mb-2">Total Observations</h3>
                      <p className="text-3xl font-bold">{observations.length}</p>
                    </div>
                    <div className="p-6 bg-blue-500 rounded-lg text-white">
                      <h3 className="text-lg font-semibold mb-2">Avg Utilization</h3>
                      <p className="text-3xl font-bold">
                        {analysisResults.length > 0 
                          ? Math.round(analysisResults.reduce((sum, r) => sum + r.utilizationFactor, 0) / analysisResults.length)
                          : 0}%
                      </p>
                    </div>
                    <div className="p-6 bg-purple-500 rounded-lg text-white">
                      <h3 className="text-lg font-semibold mb-2">Avg Performance</h3>
                      <p className="text-3xl font-bold">
                        {analysisResults.length > 0 
                          ? Math.round(analysisResults.reduce((sum, r) => sum + r.avgPerformanceRating, 0) / analysisResults.length)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {/* Detailed Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 rounded-lg">
                      <thead>
                        <tr style={{ backgroundColor: '#322b80', color: 'white' }}>
                          <th className="p-3 text-left">Position</th>
                          <th className="p-3 text-left">Observations</th>
                          <th className="p-3 text-left">Busy Count</th>
                          <th className="p-3 text-left">Utilization %</th>
                          <th className="p-3 text-left">Avg Performance</th>
                          <th className="p-3 text-left">Est. Annual Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResults.map(result => (
                          <tr key={result.positionId} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="p-3 font-medium">{result.positionName}</td>
                            <td className="p-3">{result.totalObservations}</td>
                            <td className="p-3">{result.busyCount}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full"
                                    style={{ 
                                      width: `${Math.min(result.utilizationFactor, 100)}%`,
                                      backgroundColor: '#322b80'
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{result.utilizationFactor.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="p-3">{result.avgPerformanceRating.toFixed(1)}%</td>
                            <td className="p-3">{Math.round(result.estimatedAnnualHours)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Export Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const data = {
                          positions,
                          observations,
                          studyParameters,
                          analysisResults,
                          exportDate: new Date().toISOString()
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `work-sampling-analysis-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#322b80' }}
                    >
                      <Download size={20} />
                      Export Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkSamplingPage;