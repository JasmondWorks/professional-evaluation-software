"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/utils/apiFetch";
import { notify } from "@/lib/toast";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Table,
} from "@/app/components/ui";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";
import { Modal } from "@/app/components/ui/modal";
import type { TableColumn } from "@/app/components/ui/Table";
import { useCurrentUser } from "@/app/components/useCurrentUser";
import { AUDITOR_QUESTIONS } from "@/app/lib/auditorQuestions";
import { safeHttpsUrl } from "@/app/lib/safeUrl";

// One page, two audiences. An org admin manages their own org's roster; the
// platform admin sees every auditor in the system plus global-recognition
// requests. Same route and nav entry ("External Auditors") for both, because
// from the outside they're the same screen — only the content a viewer is
// authorized to see differs, matching how roleAccess already scopes the APIs
// behind each view.

type OrgAuditorRow = {
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

function OrgAuditorsView() {
  const [auditors, setAuditors] = useState<OrgAuditorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [removing, setRemoving] = useState<OrgAuditorRow | null>(null);
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

  const columns: TableColumn<OrgAuditorRow>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "gsm", label: "GSM" },
    {
      key: "dob",
      label: "DOB",
      render: (a) => new Date(a.dob).toLocaleDateString(),
    },
    { key: "address", label: "Address", minWidth: "320px" },
    {
      key: "status",
      label: "Status",
      render: (a) => <Badge tone={statusTone(a.status)}>{a.status}</Badge>,
    },
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
    <>
      <p className="text-sm text-muted mb-6">
        An auditor becomes active as soon as they submit this questionnaire —
        there's nothing to approve here. Remove one if they shouldn't be
        auditing for your organization anymore.
      </p>

      <Table
        columns={columns}
        data={auditors}
        loading={loading}
        emptyMessage="No auditors yet."
      />

      {expanded && (
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-sm font-semibold text-strong">
              {expanded.name}'s questionnaire
            </h3>
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
                    <span
                      className={
                        row.response?.toString().toLowerCase() === "yes"
                          ? "text-success-600"
                          : "text-danger-600"
                      }
                    >
                      {row.response}
                    </span>
                  ),
                },
              ]}
              data={expanded.responses.map((response, index) => ({
                index: index + 1,
                question: AUDITOR_QUESTIONS[index],
                response,
              }))}
              emptyMessage="No questionnaire responses on file."
            />

            {expanded.credential_data && (
              <div>
                <h4 className="text-sm font-semibold text-strong mb-2">
                  Uploaded documents
                </h4>
                <ul className="list-disc ms-5 text-sm">
                  {Object.entries(expanded.credential_data)
                    .map(([label, url]) => [label, safeHttpsUrl(url)] as const)
                    .filter(([, url]) => !!url)
                    .map(([label, url]) => (
                      <li key={label}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pes underline"
                        >
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
            <Button
              variant="secondary"
              onClick={() => setRemoving(null)}
              disabled={actingId === removing?.id}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={actingId === removing?.id}
              onClick={confirmRemove}
            >
              Remove
            </Button>
          </>
        }
      />
    </>
  );
}

type PlatformAuditor = {
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
  const [auditors, setAuditors] = useState<PlatformAuditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await apiFetch("/api/admin/all-auditors");
      const data = await res.json();
      setAuditors(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  const columns: TableColumn<PlatformAuditor>[] = [
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
  const [confirming, setConfirming] = useState<{
    id: string;
    name: string;
    action: "approve" | "reject";
  } | null>(null);

  const fetchPending = async () => {
    const res = await apiFetch("/api/super/global-recognition");
    const data = await res.json();
    setPending(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (
    auditorId: string,
    action: "approve" | "reject",
  ) => {
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
      render: (p) =>
        p.global_recognition_requested_at
          ? new Date(p.global_recognition_requested_at).toLocaleDateString()
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
          >
            {expandedId === p.id ? "Hide details" : "View details"}
          </Button>
          <Button
            size="sm"
            variant="primary"
            loading={actingId === p.id}
            onClick={() =>
              setConfirming({ id: p.id, name: p.name, action: "approve" })
            }
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            loading={actingId === p.id}
            onClick={() =>
              setConfirming({ id: p.id, name: p.name, action: "reject" })
            }
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
        Auditors added by an organization admin who answered "Yes" to the global
        recognition question. Approving grants platform-wide recognition,
        visible to every organization.
      </p>

      <Table
        columns={columns}
        data={pending}
        loading={loading}
        emptyMessage="No pending requests."
      />

      {expanded && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-strong">
              {expanded.name}'s questionnaire
            </h3>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            {expanded.responses ? (
              <Table
                columns={[
                  { key: "index", label: "#", width: "48px" },
                  { key: "question", label: "Question" },
                  { key: "response", label: "Response" },
                ]}
                data={expanded.responses.map((response, index) => ({
                  index: index + 1,
                  question: AUDITOR_QUESTIONS[index],
                  response,
                }))}
                emptyMessage="No questionnaire responses on file."
              />
            ) : (
              <p className="text-sm text-muted">
                No questionnaire responses on file.
              </p>
            )}

            {expanded.credential_data && (
              <div>
                <h4 className="text-sm font-semibold text-strong mb-2">
                  Uploaded documents
                </h4>
                <ul className="list-disc ms-5 text-sm">
                  {Object.entries(expanded.credential_data)
                    .map(([label, url]) => [label, safeHttpsUrl(url)] as const)
                    .filter(([, url]) => !!url)
                    .map(([label, url]) => (
                      <li key={label}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pes underline"
                        >
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
        title={
          confirming?.action === "approve"
            ? "Grant global recognition?"
            : "Reject this recognition request?"
        }
        description={
          confirming
            ? confirming.action === "approve"
              ? `${confirming.name} will be recognized platform-wide, visible to every organization.`
              : `${confirming.name}'s request will be rejected. They can request again later.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirming(null)}
              disabled={actingId === confirming?.id}
            >
              Cancel
            </Button>
            <Button
              variant={
                confirming?.action === "approve" ? "primary" : "destructive"
              }
              loading={actingId === confirming?.id}
              onClick={() =>
                confirming && handleAction(confirming.id, confirming.action)
              }
            >
              {confirming?.action === "approve" ? "Approve" : "Reject"}
            </Button>
          </>
        }
      />
    </div>
  );
}

function PlatformAuditorsView() {
  return (
    <Tabs syncParam="tab" defaultValue="all" className="mt-6">
      <TabsList>
        <TabsTrigger value="all">All Auditors</TabsTrigger>
        <TabsTrigger value="recognition">
          Global Recognition Requests
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <AllAuditorsTab />
      </TabsContent>
      <TabsContent value="recognition">
        <GlobalRecognitionTab />
      </TabsContent>
    </Tabs>
  );
}

export default function ExternalAuditorsPage() {
  const { user } = useCurrentUser();
  const isPlatform = user?.role === "super-admin";

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <PageHeader
        title="External Auditors"
        subtitle={
          isPlatform
            ? "Every auditor in the system, and global recognition requests awaiting your decision."
            : "Auditors active in your organization."
        }
      />

      {!user ? null : isPlatform ? (
        <PlatformAuditorsView />
      ) : (
        <OrgAuditorsView />
      )}
    </div>
  );
}
