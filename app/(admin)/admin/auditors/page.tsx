"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { apiFetch } from '@/app/utils/apiFetch';
import { getAccessToken } from '@/app/utils/auth';
import { Badge, Button, Card, CardBody, DataTable, Modal, PageHeader, Table } from "@/app/components/ui";
import { notify } from "@/lib/toast";
import { AUDITOR_QUESTIONS } from "@/app/lib/auditor/questions";

type Auditor = {
  id: string;
  name: string;
  email: string;
  gsm: string;
  dob: string;
  address: string;
  status: string;
  rejection_reason: string | null;
  recognitionConsent: boolean;
  responses: string[];
  documents: { key: string; label: string; url: string }[] | null;
};

function statusTone(status: string) {
  if (status === "approved") return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "warning" as const;
}

export default function AdminAuditorsPage() {
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Auditor | null>(null);
  const [isPlatform, setIsPlatform] = useState(false);
  const [rejecting, setRejecting] = useState<{ id: string; name: string } | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAuditors = async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/auditors");
    const data = await res.json();
    setAuditors(data);
    setLoading(false);
  };

  useEffect(() => {
    const token = getAccessToken();
    setIsPlatform(token ? jwtDecode<any>(token)?.role === "super-admin" : false);
    fetchAuditors();
  }, []);

  const handleApprove = async (id: string) => {
    const res = await apiFetch("/api/admin/auditors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "approve" }),
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      notify.error(data.message || data.error || "Could not approve this auditor.");
    } else {
      notify.success(data.message || "Auditor approved.");
    }
    fetchAuditors();
  };

  const submitReject = async () => {
    if (!rejecting || !reason.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/admin/auditors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejecting.id, action: "reject", reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reject this auditor.");
      notify.success(data.message || "Auditor rejected.");
      setRejecting(null);
      setReason("");
      fetchAuditors();
    } catch (err: any) {
      notify.error(err.message || "Could not reject this auditor.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "gsm", label: "GSM" },
    {
      key: "dob",
      label: "DOB",
      render: (a: Auditor) => new Date(a.dob).toLocaleDateString(),
    },
    { key: "address", label: "Address" },
    {
      key: "status",
      label: "Status",
      render: (a: Auditor) => <Badge tone={statusTone(a.status)}>{a.status}</Badge>,
    },
    ...(isPlatform
      ? [
          {
            key: "actions",
            label: "Actions",
            render: (a: Auditor) =>
              a.status === "pending" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleApprove(a.id);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setReason("");
                      setRejecting({ id: a.id, name: a.name });
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <PageHeader title="Auditor Submissions" />

      <DataTable
        columns={columns}
        data={auditors}
        loading={loading}
        emptyMessage="No auditor submissions yet."
        searchable
        searchKeys={["name", "email"]}
        onRowClick={(a) => setExpanded(expanded?.id === a.id ? null : a)}
      />

      {expanded && (
        <Card className="mt-4">
          <CardBody>
            <h3 className="font-bold mb-2">Uploaded documents:</h3>
            {expanded.documents === null ? (
              <p className="mb-4 text-sm text-muted">
                Withheld &mdash; this auditor did not consent to recognition by PES.
              </p>
            ) : expanded.documents.length === 0 ? (
              <p className="mb-4 text-sm text-muted">
                This auditor uploaded no credential documents.
              </p>
            ) : (
              <ul className="mb-4 flex flex-wrap gap-2">
                {expanded.documents.map((doc) => (
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
                  expanded.recognitionConsent
                    ? "font-semibold text-success-600"
                    : "text-muted"
                }
              >
                {expanded.recognitionConsent ? "Granted" : "Not granted"}
              </span>
            </p>
            {expanded.status === "rejected" && expanded.rejection_reason && (
              <p className="mb-4 text-sm">
                <span className="font-bold">Rejection reason: </span>
                {expanded.rejection_reason}
              </p>
            )}

            <h3 className="font-bold mb-2">Responses:</h3>
            <Table
              columns={[
                { key: "index", label: "#", width: "48px" },
                { key: "question", label: "Question" },
                {
                  key: "response",
                  label: "Response",
                  render: (r: { response: string }) => (
                    <span className={r.response.toLowerCase() === "yes" ? "text-success-600" : "text-danger-600"}>
                      {r.response}
                    </span>
                  ),
                },
              ]}
              data={expanded.responses.map((response, index) => ({
                index: index + 1,
                question: AUDITOR_QUESTIONS[index],
                response,
              }))}
            />
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={!!rejecting}
        setIsOpen={(open) => { if (!open) { setRejecting(null); setReason(""); } }}
        title={`Reject ${rejecting?.name ?? "auditor"}`}
        description="This reason is shown to the auditor on their status page."
        footer={
          <>
            <Button variant="outline" onClick={() => { setRejecting(null); setReason(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || submitting}
              loading={submitting}
              onClick={submitReject}
            >
              Reject
            </Button>
          </>
        }
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this submission is being rejected…"
          className="w-full min-h-28 px-3 py-2 border rounded-lg text-sm"
        />
      </Modal>
    </div>
  );
}
