"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Table,
} from "@/app/components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Modal } from "@/app/components/ui/modal";
import type { TableColumn } from "@/app/components/ui/Table";
import { apiFetch } from "@/app/utils/apiFetch";
import { notify } from "@/lib/toast";
import { AUDITOR_QUESTIONS } from "@/app/lib/auditorQuestions";
import { safeHttpsUrl } from "@/app/lib/safeUrl";

type Auditor = {
  id: string;
  name: string;
  email: string;
  org: string;
  org_id: string | null;
  globally_recognized: boolean;
};

type RecognitionRequest = {
  id: string;
  name: string;
  email: string;
  gsm: string | null;
  global_recognition_requested_at: string | null;
  responses: string[] | null;
  credential_data: Record<string, string> | null;
};

function AllAuditorsTab() {
  const router = useRouter();
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/admin/all-auditors");
      const data = await res.json();
      setAuditors(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const columns: TableColumn<Auditor>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "org", label: "Organization" },
    {
      key: "globally_recognized",
      label: "Recognition",
      render: (a) =>
        a.globally_recognized ? (
          <Badge tone="success">Globally recognized</Badge>
        ) : (
          <Badge tone="neutral">Local</Badge>
        ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={auditors}
      loading={loading}
      emptyMessage="No auditors found."
      onRowClick={(a) => a.org_id && router.push(`/organizations/${a.org_id}`)}
    />
  );
}

function GlobalRecognitionTab() {
  const [pending, setPending] = useState<RecognitionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ id: string; name: string; action: "approve" | "reject" } | null>(null);

  const fetchPending = async () => {
    const res = await apiFetch("/api/super/global-recognition");
    const data = await res.json();
    setPending(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (auditorId: string, action: "approve" | "reject") => {
    setActingId(auditorId);
    try {
      const res = await apiFetch("/api/super/global-recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditorId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify.error(data.error ?? "Could not complete that action.");
        return;
      }
      notify.success(data.message ?? "Done.");
      if (expandedId === auditorId) setExpandedId(null);
      fetchPending();
    } finally {
      setActingId(null);
      setConfirming(null);
    }
  };

  const expanded = pending.find((p) => p.id === expandedId) ?? null;

  const columns: TableColumn<RecognitionRequest>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "gsm", label: "GSM", render: (p) => p.gsm ?? "—" },
    {
      key: "global_recognition_requested_at",
      label: "Requested",
      render: (p) => (p.global_recognition_requested_at ? new Date(p.global_recognition_requested_at).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
            {expandedId === p.id ? "Hide details" : "View details"}
          </Button>
          <Button
            size="sm"
            variant="primary"
            loading={actingId === p.id}
            onClick={() => setConfirming({ id: p.id, name: p.name, action: "approve" })}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            loading={actingId === p.id}
            onClick={() => setConfirming({ id: p.id, name: p.name, action: "reject" })}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Auditors added by an organization admin who answered "Yes" to the global recognition question. Approving grants
        platform-wide recognition, visible to every organization.
      </p>

      <Table columns={columns} data={pending} loading={loading} emptyMessage="No pending requests." />

      {expanded && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-strong">{expanded.name}'s questionnaire</h3>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {expanded.responses ? (
              <Table
                columns={[
                  { key: "index", label: "#", width: "48px" },
                  { key: "question", label: "Question" },
                  { key: "response", label: "Response" },
                ]}
                data={expanded.responses.map((response, index) => ({ index: index + 1, question: AUDITOR_QUESTIONS[index], response }))}
                emptyMessage="No questionnaire responses on file."
              />
            ) : (
              <p className="text-sm text-muted">No questionnaire responses on file.</p>
            )}

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
        isOpen={!!confirming}
        setIsOpen={(open) => !open && setConfirming(null)}
        title={confirming?.action === "approve" ? "Grant global recognition?" : "Reject this recognition request?"}
        description={
          confirming
            ? confirming.action === "approve"
              ? `${confirming.name} will be recognized platform-wide, visible to every organization.`
              : `${confirming.name}'s request will be rejected. They can request again later.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(null)} disabled={actingId === confirming?.id}>
              Cancel
            </Button>
            <Button
              variant={confirming?.action === "approve" ? "primary" : "destructive"}
              loading={actingId === confirming?.id}
              onClick={() => confirming && handleAction(confirming.id, confirming.action)}
            >
              {confirming?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </>
        }
      />
    </div>
  );
}

export default function AuditorsPage() {
  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <PageHeader title="Auditors" subtitle="Every auditor in the system, and global recognition requests awaiting your decision." />

      <Tabs syncParam="tab" defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Auditors</TabsTrigger>
          <TabsTrigger value="recognition">Global Recognition Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AllAuditorsTab />
        </TabsContent>
        <TabsContent value="recognition">
          <GlobalRecognitionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
