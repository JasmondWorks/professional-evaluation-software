"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "iconsax-react";
import Link from "next/link";
import { getAccessToken } from "@/app/utils/auth";
import { TableColumn } from "@/app/components/ui/Table";
import { DataTable } from "@/app/components/ui";
import { apiFetch } from '@/app/utils/apiFetch';
import RemoveRecordButton from "@/app/components/models/RemoveRecordButton";

type HistoryRecord = {
  id: number;
  created_at: string;
  kmin: number;
  kmax: number;
  kstar: number;
  hstar: number;
  lambda: number | null;
  mu: number | null;
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
    // The two rates that produced the run. They are what the organization
    // structure model asks for level by level, so a stored run is only reusable
    // if you can see which λ and μ it came from.
    {
      key: "lambda",
      label: "\u03bb",
      render: (item) => (item.lambda == null ? "—" : Number(item.lambda).toFixed(4)),
    },
    {
      key: "mu",
      label: "\u03bc",
      render: (item) => (item.mu == null ? "—" : Number(item.mu).toFixed(4)),
    },
    {
      key: "constraints_ok",
      label: "Status",
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.constraints_ok ? 'bg-green-100 text-green-700' : 'bg-danger-100 text-danger-700'}`}>
          {item.constraints_ok ? 'Valid' : 'Violations'}
        </span>
      )
    },
    {
      key: "id",
      label: "",
      render: (item) => (
        <RemoveRecordButton
          source="personnel-utilization"
          id={item.id}
          label={`the run of ${new Date(item.created_at).toLocaleDateString()}`}
          onRemoved={(id) => setData((rows) => rows.filter((r) => r.id !== id))}
        />
      ),
    },
  ];

  return (
    <div className="bg-canvas min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/models/personnel-utilization">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-line hover:bg-canvas transition-colors mr-4 shadow-sm cursor-pointer">
              <ArrowLeft size={20} className="text-body" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-strong">Personnel Utilization History</h1>
            <p className="text-sm text-muted mt-1">Review past calculations and mathematical model results</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-line p-6">
          <DataTable 
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
