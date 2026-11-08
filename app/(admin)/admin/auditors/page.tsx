"use client";

import React from "react";
import { useEffect, useState } from "react";
import { apiFetch } from '@/app/utils/apiFetch';
import Button from "@/app/components/ui/Button";
import { AUDITOR_QUESTIONS } from "@/app/lib/auditor/questions";

export default function AdminAuditorsPage() {
  const [auditors, setAuditors] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]); // Tracks expanded rows
  const [message, setMessage] = useState("");

  const fetchAuditors = async () => {
    const res = await apiFetch("/api/admin/auditors");
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
    const res = await apiFetch("/api/admin/auditors", {
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

      <table className="w-full border border-line rounded-lg overflow-hidden">
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
                className="border-b text-sm hover:bg-line/50 cursor-pointer"
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
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          // Approve action
                          handleAction(a.id, "approve");
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          // Reject action
                          handleAction(a.id, "reject");
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
              {expandedRows.includes(a.id) && (
                <tr className="bg-canvas">
                  <td colSpan={7} className="p-4">
                    <h3 className="font-bold mb-2">Uploaded documents:</h3>
                    {a.documents === null ? (
                      <p className="mb-4 text-sm text-muted">
                        Withheld &mdash; this auditor did not consent to recognition by PES.
                      </p>
                    ) : a.documents.length === 0 ? (
                      <p className="mb-4 text-sm text-muted">
                        This auditor uploaded no credential documents.
                      </p>
                    ) : (
                      <ul className="mb-4 flex flex-wrap gap-2">
                        {a.documents.map((doc: { key: string; label: string; url: string }) => (
                          <li key={doc.key}>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-lg border border-line bg-white px-2.5 py-1 text-sm text-pes hover:bg-canvas"
                            >
                              {doc.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mb-4 text-sm">
                      Recognition by PES:{" "}
                      <span
                        className={
                          a.recognitionConsent
                            ? "font-semibold text-success-600"
                            : "text-muted"
                        }
                      >
                        {a.recognitionConsent ? "Granted" : "Not granted"}
                      </span>
                    </p>

                    <h3 className="font-bold mb-2">Responses:</h3>
                    <table className="w-full border border-line rounded-lg">
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
                            <td className="p-2 text-xs">{ AUDITOR_QUESTIONS[index] }</td>
                            <td className={`p-2 ${ (response.toString().toLowerCase() === 'yes') ? 'text-success-600' : 'text-danger-600'}`}>{ response }</td>
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
