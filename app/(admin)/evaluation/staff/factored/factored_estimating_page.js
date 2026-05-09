'use client';

import { useState } from 'react';

export default function FactoredEstimatingPage() {
  const [historicalTasks, setHistoricalTasks] = useState([
    { id: 1, name: 'Cleaner pay voucher', observed: 0.6, estimated: 0.75 },
    { id: 2, name: 'Junior staff voucher', observed: 1.3, estimated: 1.6 },
    { id: 3, name: 'Senior staff voucher', observed: 1.2, estimated: 1.3 },
    { id: 4, name: 'Car maintenance voucher', observed: 0.03, estimated: 0.04 }
  ]);

  const [newTask, setNewTask] = useState({
    name: 'Write casual voucher',
    estimate: 1.8,
    performanceRating: 125,
    allowancePercentage: 9
  });

  const [nextTaskId, setNextTaskId] = useState(5);

  // Calculate corrective factor for each task
  const calculateCorrectiveFactor = (observed, estimated) => {
    if (estimated === 0) return 0;
    return (observed - estimated) / estimated;
  };

  // Calculate average corrective factor
  const getAverageCorrectiveFactor = () => {
    const factors = historicalTasks.map(task => 
      calculateCorrectiveFactor(task.observed, task.estimated)
    );
    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  };

  // Calculate corrected estimate
  const getCorrectedEstimate = () => {
    const avgFactor = getAverageCorrectiveFactor();
    return newTask.estimate * (1 + avgFactor);
  };

  // Calculate basic time
  const getBasicTime = () => {
    const correctedEstimate = getCorrectedEstimate();
    return correctedEstimate * (newTask.performanceRating / 100);
  };

  // Calculate standard time
  const getStandardTime = () => {
    const basicTime = getBasicTime();
    return basicTime + (newTask.allowancePercentage / 100 * basicTime);
  };

  const addHistoricalTask = () => {
    setHistoricalTasks([...historicalTasks, {
      id: nextTaskId,
      name: '',
      observed: 0,
      estimated: 0
    }]);
    setNextTaskId(nextTaskId + 1);
  };

  const updateHistoricalTask = (id, field, value) => {
    setHistoricalTasks(historicalTasks.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const removeHistoricalTask = (id) => {
    setHistoricalTasks(historicalTasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Factored Estimating Calculator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Improve your time estimates by learning from historical data. 
            This tool calculates corrective factors from past performance to provide more accurate future estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Historical Data Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Historical Task Data
              </h2>
              <button
                onClick={addHistoricalTask}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Task
              </button>
            </div>
            
            <div className="space-y-4">
              {historicalTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <input
                      type="text"
                      placeholder="Task name"
                      value={task.name}
                      onChange={(e) => updateHistoricalTask(task.id, 'name', e.target.value)}
                      className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeHistoricalTask(task.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observed Time (hrs)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={task.observed}
                        onChange={(e) => updateHistoricalTask(task.id, 'observed', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Time (hrs)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={task.estimated}
                        onChange={(e) => updateHistoricalTask(task.id, 'estimated', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    Corrective Factor: {task.estimated > 0 ? 
                      calculateCorrectiveFactor(task.observed, task.estimated).toFixed(4) : 
                      'N/A'
                    }
                  </div>
                </div>
              ))}
            </div>

            {historicalTasks.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">Summary</h3>
                <p className="text-blue-800">
                  Average Corrective Factor: <span className="font-mono font-bold">
                    {getAverageCorrectiveFactor().toFixed(4)}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* New Task Estimation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              New Task Estimation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Estimate (hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newTask.estimate}
                  onChange={(e) => setNewTask({...newTask, estimate: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performance Rating (%)
                </label>
                <input
                  type="number"
                  value={newTask.performanceRating}
                  onChange={(e) => setNewTask({...newTask, performanceRating: parseFloat(e.target.value) || 100})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowance Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newTask.allowancePercentage}
                  onChange={(e) => setNewTask({...newTask, allowancePercentage: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Results */}
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 rounded-md p-4">
                <h3 className="font-medium text-green-900 mb-3">Calculation Results</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Initial Estimate:</span>
                    <span className="font-mono">{newTask.estimate.toFixed(3)} hrs</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Corrective Factor:</span>
                    <span className="font-mono">{getAverageCorrectiveFactor().toFixed(4)}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-700">Corrected Estimate:</span>
                    <span className="font-mono font-semibold">{getCorrectedEstimate().toFixed(3)} hrs</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Basic Time:</span>
                    <span className="font-mono">{getBasicTime().toFixed(3)} hrs</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-green-800 font-medium">Standard Time:</span>
                    <span className="font-mono font-bold text-green-800 text-lg">
                      {getStandardTime().toFixed(3)} hrs
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula Explanation */}
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">Calculation Steps:</h4>
                <div className="text-xs text-gray-600 space-y-1 font-mono">
                  <div>1. Corrected = {newTask.estimate} × (1 + {getAverageCorrectiveFactor().toFixed(4)}) = {getCorrectedEstimate().toFixed(3)}</div>
                  <div>2. Basic = {getCorrectedEstimate().toFixed(3)} × ({newTask.performanceRating}/100) = {getBasicTime().toFixed(3)}</div>
                  <div>3. Standard = {getBasicTime().toFixed(3)} + ({newTask.allowancePercentage}% × {getBasicTime().toFixed(3)}) = {getStandardTime().toFixed(3)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Method Explanation */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How Factored Estimating Works
          </h2>
          
          <div className="prose prose-sm text-gray-600">
            <p>
              Factored estimating improves accuracy by learning from historical performance data. 
              The method calculates a corrective factor based on the difference between estimated and actual times for similar tasks.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">Step 1: Historical Analysis</h3>
                <p className="text-blue-800 text-sm">
                  Collect observed vs estimated times for similar tasks to calculate individual corrective factors.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-medium text-green-900 mb-2">Step 2: Apply Correction</h3>
                <p className="text-green-800 text-sm">
                  Use the average corrective factor to adjust new estimates, accounting for systematic biases.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-md">
                <h3 className="font-medium text-purple-900 mb-2">Step 3: Final Adjustments</h3>
                <p className="text-purple-800 text-sm">
                  Apply performance ratings and allowances to get the final standard time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}