"use client";

import React from "react";
import { useEffect, useState } from "react";

export default function AdminAuditorsPage() {
  const [auditors, setAuditors] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]); // Tracks expanded rows
  const [message, setMessage] = useState("");
  const questions = [
    "Will you be validating the input data for the current Appraisal and evaluation period?",
    "Will you be validating the entire process based on accountability and fair judgment?",
    "Will your validating of the process be based on Guided Standard which you will make available at the end of the process?",
    "Will exceptions be raised for conflicts detected in the system?",
    "Will your roles as an invited external auditor be independent?",
    "Are you ready to suggest workable frameworks where you deem it fit?",
    "Do you accept that your Management letter at the end of the process be made available to the management?",
    "Where awards are applicable for motivation purposes as suggested by the system software, will you validate to ensure that there isn’t marginalization or nepotism?",
    "Are you welcome to open criticism?",
    "If invited again in the future, will you accept the invitation even if you were openly criticized?",
  ];

  const fetchAuditors = async () => {
    const res = await fetch("/api/admin/auditors");
    const data = await res.json();
    setAuditors(data);
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    fetchAuditors();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    const res = await fetch("/api/admin/auditors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchAuditors(); // refresh list
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Pending Auditor Submissions</h1>

      {message && <p className="mb-4 text-sm text-pes font-medium">{message}</p>}

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-pes text-white">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">GSM</th>
            <th className="p-2">DOB</th>
            <th className="p-2">Address</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {auditors.map((a) => (
            <React.Fragment key={a.id}>
              <tr
                className="border-b text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleRow(a.id)}
              >
                <td className="p-2">{a.name}</td>
                <td className="p-2">{a.email}</td>
                <td className="p-2">{a.gsm}</td>
                <td className="p-2">{new Date(a.dob).toLocaleDateString()}</td>
                <td className="p-2">{a.address}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2 flex gap-2">
                  {a.status === "pending" && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Approve action
                          handleAction(a.id, "approve");
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:opacity-90"
                      >
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Reject action
                          handleAction(a.id, "reject");
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:opacity-90"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
              {expandedRows.includes(a.id) && (
                <tr className="bg-gray-50">
                  <td colSpan={7} className="p-4">
                    <h3 className="font-bold mb-2">Responses:</h3>
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="p-2">#</th>
                          <th className="p-2">Question</th>
                          <th className="p-2">Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.responses.map((response: string, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2 text-xs">{ questions[index] }</td>
                            <td className={`p-2 text-${ (response.toString().toLowerCase() === 'yes')? 'green': 'red'}-500`}>{ response }</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
