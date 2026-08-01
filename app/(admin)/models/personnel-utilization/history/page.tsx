"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "iconsax-react";
import Link from "next/link";
import { getAccessToken } from "@/app/utils/auth";
import Table, { TableColumn } from "@/app/components/ui/Table";
import { apiFetch } from '@/app/utils/apiFetch';

type HistoryRecord = {
  id: number;
  created_at: string;
  kmin: number;
  kmax: number;
  kstar: number;
  hstar: number;
  p0: number;
  y: number;
  constraints_ok: boolean;
};

export default function PersonnelUtilizationHistory() {
  const [data, setData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const token = getAccessToken();
      if (!token) return;

      try {
        const req = await apiFetch("/api/getPersonnelUtilization", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        const res = await req.json();
        
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const columns: TableColumn<HistoryRecord>[] = [
    {
      key: "created_at",
      label: "Date",
      render: (item) => new Date(item.created_at).toLocaleDateString() + " " + new Date(item.created_at).toLocaleTimeString(),
    },
    { key: "kmin", label: "K-Min" },
    { key: "kmax", label: "K-Max" },
    { 
      key: "kstar", 
      label: "Optimal K*",
      render: (item) => <span className="font-bold text-pes">{item.kstar}</span>
    },
    { 
      key: "hstar", 
      label: "Efficiency (H*)",
      render: (item) => `${(item.hstar * 100).toFixed(2)}%`
    },
    {
      key: "p0",
      label: "Idleness (P0)",
      render: (item) => `${(item.p0 * 100).toFixed(2)}%`
    },
    {
      key: "constraints_ok",
      label: "Status",
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.constraints_ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {item.constraints_ok ? 'Valid' : 'Violations'}
        </span>
      )
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/models/personnel-utilization">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors mr-4 shadow-sm cursor-pointer">
              <ArrowLeft size={20} className="text-gray-600" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personnel Utilization History</h1>
            <p className="text-sm text-gray-500 mt-1">Review past calculations and mathematical model results</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <Table 
            columns={columns} 
            data={data} 
            loading={loading} 
            emptyMessage="No historical data found. Run the model to generate results." 
          />
        </div>
      </div>
    </div>
  );
}
