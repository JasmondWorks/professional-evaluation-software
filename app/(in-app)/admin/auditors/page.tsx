"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetch";
import { notify } from "@/lib/toast";
import { Badge, Button, Card, CardBody, CardHeader, PageHeader, Table } from "@/app/components/ui";
import { Modal } from "@/app/components/ui/modal";
import type { TableColumn } from "@/app/components/ui/Table";
import { AUDITOR_QUESTIONS } from "@/app/lib/auditorQuestions";
import { safeHttpsUrl } from "@/app/lib/safeUrl";

type AuditorRow = {
  id: number;
  name: string;
  email: string;
  gsm: string;
  dob: string;
  address: string;
  status: string;
  responses: string[];
  credential_data: Record<string, string> | null;
};

function statusTone(status: string) {
  if (status === "approved") return "success" as const;
  if (status === "removed") return "danger" as const;
  return "warning" as const;
}

export default function AdminAuditorsPage() {
  const [auditors, setAuditors] = useState<AuditorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [removing, setRemoving] = useState<AuditorRow | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchAuditors = async () => {
    const res = await apiFetch("/api/admin/auditors");
    const data = await res.json();
    setAuditors(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAuditors();
  }, []);

  const confirmRemove = async () => {
    if (!removing) return;
    setActingId(removing.id);
    try {
      const res = await apiFetch("/api/admin/auditors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: removing.id, action: "remove" }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? "Could not remove this auditor.");
        return;
      }
      notify.success(data.message ?? "Auditor removed.");
      if (expandedId === removing.id) setExpandedId(null);
      await fetchAuditors();
    } finally {
      setActingId(null);
      setRemoving(null);
    }
  };

  const expanded = auditors.find((a) => a.id === expandedId) ?? null;

  const columns: TableColumn<AuditorRow>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "gsm", label: "GSM" },
    { key: "dob", label: "DOB", render: (a) => new Date(a.dob).toLocaleDateString() },
    { key: "address", label: "Address" },
    { key: "status", label: "Status", render: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge> },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (a) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setExpandedId(expandedId === a.id ? null : a.id);
            }}
          >
            {expandedId === a.id ? "Hide details" : "View details"}
          </Button>
          {a.status === "approved" && (
            <Button
              size="sm"
              variant="destructive"
              loading={actingId === a.id}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setRemoving(a);
              }}
            >
              Remove
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <PageHeader
        title="Your Organization's Auditors"
        subtitle="An auditor becomes active as soon as they submit this questionnaire — there's nothing to approve here. Remove one if they shouldn't be auditing for your organization anymore."
      />

      <Table columns={columns} data={auditors} loading={loading} emptyMessage="No auditors yet." />

      {expanded && (
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-sm font-semibold text-strong">{expanded.name}'s questionnaire</h3>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Table
              columns={[
                { key: "index", label: "#", width: "48px" },
                { key: "question", label: "Question" },
                {
                  key: "response",
                  label: "Response",
                  render: (row: { response: string }) => (
                    <span className={row.response?.toString().toLowerCase() === "yes" ? "text-success-600" : "text-danger-600"}>
                      {row.response}
                    </span>
                  ),
                },
              ]}
              data={expanded.responses.map((response, index) => ({ index: index + 1, question: AUDITOR_QUESTIONS[index], response }))}
              emptyMessage="No questionnaire responses on file."
            />

            {expanded.credential_data && (
              <div>
                <h4 className="text-sm font-semibold text-strong mb-2">Uploaded documents</h4>
                <ul className="list-disc ms-5 text-sm">
                  {Object.entries(expanded.credential_data)
                    .map(([label, url]) => [label, safeHttpsUrl(url)] as const)
                    .filter(([, url]) => !!url)
                    .map(([label, url]) => (
                      <li key={label}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-pes underline">
                          {label}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={!!removing}
        setIsOpen={(open) => !open && setRemoving(null)}
        title="Remove this auditor?"
        description={
          removing
            ? `${removing.name} will no longer be able to audit for your organization. They can be re-added later if needed.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)} disabled={actingId === removing?.id}>
              Cancel
            </Button>
            <Button variant="destructive" loading={actingId === removing?.id} onClick={confirmRemove}>
              Remove
            </Button>
          </>
        }
      />
    </div>
  );
}
