'use client';

import React, { useState } from 'react';

export default function RedundancyIndex() {
  const [data, setData] = useState({ wasted: '', total: '' });
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  function evaluateIndex() {
    const wasted = parseFloat(data.wasted);
    const total = parseFloat(data.total);

    if (isNaN(wasted) || isNaN(total)) return alert('Please enter valid numbers');
    if (total === 0) return alert('Total man-hours cannot be zero');

    const index = wasted / total;
    setResult(Number(index.toFixed(4))); // keep to 4 decimals
    setSuccessMsg('');
  }

  async function handleSubmit() {
    if (result === null) return alert('Please evaluate the index first');

    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/addPersonnelIndex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          payload: 'redundancy',
          redundancy: Number(result), // ensure numeric type
        }),
      });

      if (!res.ok) throw new Error('Failed to save data');

      setSuccessMsg('✅ Successfully saved to database');
      setData({ wasted: '', total: '' });
      setResult(null);
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Error saving redundancy index ❌');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="m-6">
      <h1 className="font-bold text-3xl mb-6">Redundancy Index</h1>

      <div className="flex gap-8 mb-6 flex-wrap">
        <label className="flex flex-col w-72">
          Wasted Man-hours
          <input
            type="number"
            name="wasted"
            value={data.wasted}
            onChange={(e) => setData((d) => ({ ...d, wasted: e.target.value }))}
            className="border px-4 py-2 rounded mt-1"
            placeholder="Enter wasted hours"
          />
        </label>

        <label className="flex flex-col w-72">
          Total Establishment Man-hours
          <input
            type="number"
            name="total"
            value={data.total}
            onChange={(e) => setData((d) => ({ ...d, total: e.target.value }))}
            className="border px-4 py-2 rounded mt-1"
            placeholder="Enter total hours"
          />
        </label>
      </div>

      {result !== null && (
        <p className="text-green-700 font-semibold mb-3">
          Redundancy Index: {result}
        </p>
      )}

      {successMsg && (
        <p className="text-green-600 font-semibold mb-3">{successMsg}</p>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          className="bg-pes hover:opacity-90 text-white font-semibold px-12 py-3 rounded"
          onClick={evaluateIndex}
        >
          Evaluate
        </button>

        <button
          type="button"
          className={`${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-pes hover:opacity-90'
          } text-white font-semibold px-12 py-3 rounded`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
