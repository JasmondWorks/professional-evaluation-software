"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { DocumentDownload, InfoCircle } from "iconsax-react";
import { Alert, Badge, Button, FileUpload, Modal } from "@/app/components/ui";
import { apiFetch } from "@/app/utils/apiFetch";
import { notify } from "@/lib/toast";
import {
  checkHeaders,
  csvCell,
  labelFor,
  templateCsv,
  type HeaderCheck,
} from "@/app/lib/bulk-upload/columns";
import { DEFAULT_MAX_ROWS, type BulkUploadSpec } from "@/app/lib/bulk-upload/spec";

/** One modal for every bulk upload in the app. Give it a spec; it does the rest.
 *
 *  Every decision it makes is shown rather than applied quietly: which headers
 *  were not understood, which rows were dropped as duplicates, which records
 *  already exist, and which rows cannot be created and why. Somebody uploading
 *  fifty rows should never have to guess what happened to the six that did not
 *  appear.
 *
 *  See app/lib/bulk-upload/README.md. */

type RowStatus = "ready" | "duplicate" | "exists" | "invalid";

type PreviewRow = {
  /** The row number in the uploader's spreadsheet: the header is row 1. */
  row: number;
  data: Record<string, string>;
  status: RowStatus;
  errors: string[];
};

export type BulkUploadResult = {
  summary: {
    received: number; created: number; skipped: number;
    failed: number; emailsSent?: number; emailsFailed?: number;
  };
  results: {
    row: number; label?: string; key?: string;
    status: "created" | "skipped" | "failed"; reason?: string; emailFailed?: boolean;
  }[];
};

const STATUS_LABEL: Record<RowStatus, string> = {
  ready: "Ready",
  duplicate: "Duplicate in file",
  exists: "Already registered",
  invalid: "Has errors",
};

const STATUS_TONE: Record<RowStatus, "success" | "warning" | "danger"> = {
  ready: "success",
  duplicate: "warning",
  exists: "warning",
  invalid: "danger",
};

export default function BulkUploadModal({
  spec,
  isOpen,
  setIsOpen,
  onCompleted,
}: {
  spec: BulkUploadSpec;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCompleted?: (result: BulkUploadResult) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [headerCheck, setHeaderCheck] = useState<HeaderCheck | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [onlyProblems, setOnlyProblems] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const maxRows = spec.maxRows ?? DEFAULT_MAX_ROWS;
  const previewColumns = spec.previewColumns ?? spec.columns.slice(0, 4).map((c) => c.key);

  const counts = useMemo(() => {
    const by = (s: RowStatus) => rows.filter((r) => r.status === s).length;
    return {
      total: rows.length,
      ready: by("ready"),
      duplicate: by("duplicate"),
      exists: by("exists"),
      invalid: by("invalid"),
    };
  }, [rows]);

  function reset() {
    setFileName(null);
    setHeaderCheck(null);
    setRows([]);
    setParseError(null);
    setOnlyProblems(false);
    setResult(null);
  }

  function close() {
    reset();
    setIsOpen(false);
  }

  function download(contents: string, filename: string) {
    const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    reset();
    setFileName(file.name);

    // Existing keys and reference data, so a row can be marked as already
    // present or as naming something that does not exist, before anything is
    // submitted. Non-fatal: the server re-checks both.
    let existingKeys = new Set<string>();
    let reference: Record<string, Set<string>> = {};
    try {
      const res = await apiFetch(spec.endpoint);
      if (res.ok) {
        const d = await res.json();
        existingKeys = new Set(
          (d.existing ?? []).map((v: string) => String(v).toLowerCase()),
        );
        for (const check of spec.referenceChecks ?? []) {
          const values = d.reference?.[check.referenceKey];
          if (Array.isArray(values)) reference[check.referenceKey] = new Set(values);
        }
      }
    } catch {
      /* preview is simply less informed */
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: ({ data, meta, errors }) => {
        if (errors.length > 0 && data.length === 0) {
          setParseError(`That file could not be read as CSV. ${errors[0].message}`);
          return;
        }

        const check = checkHeaders(spec.columns, meta.fields ?? []);
        setHeaderCheck(check);
        // A file missing required columns is refused outright: showing rows from
        // a file that cannot be submitted only invites a pointless scroll.
        if (!check.ok) return;

        if (data.length > maxRows) {
          setParseError(
            `That file has ${data.length} rows. Upload at most ${maxRows} at a time.`,
          );
          return;
        }

        const seen = new Set<string>();
        const preview: PreviewRow[] = data.map((raw, i) => {
          const mapped: Record<string, string> = {};
          for (const [header, key] of Object.entries(check.mapping)) {
            mapped[key] = String(raw[header] ?? "").trim();
          }

          const key = String(mapped[spec.dedupeKey] ?? "").toLowerCase();
          const errors: string[] = [];
          let status: RowStatus = "ready";

          // The same schema the server uses, so the preview cannot promise
          // something the server will then refuse.
          const parsed = spec.schema.safeParse({ ...mapped, ...(spec.clientContext ?? {}) });
          if (!parsed.success) {
            for (const issue of parsed.error.issues) {
              const field = String(issue.path[0] ?? "row");
              if (field in (spec.clientContext ?? {})) continue;
              errors.push(`${labelFor(spec.columns, field)}: ${issue.message}`);
            }
          }

          for (const rc of spec.referenceChecks ?? []) {
            const allowed = reference[rc.referenceKey];
            const value = mapped[rc.column];
            if (value && allowed && allowed.size > 0 && !allowed.has(value)) {
              errors.push(`${labelFor(spec.columns, rc.column)}: ${rc.message(value)}`);
            }
          }

          if (errors.length > 0) status = "invalid";
          else if (key && seen.has(key)) status = "duplicate";
          else if (key && existingKeys.has(key)) status = "exists";

          if (key) seen.add(key);

          return { row: i + 2, data: mapped, status, errors };
        });

        setRows(preview);
      },
      error: (err) => setParseError(err.message),
    });
  }

  async function submit() {
    const ready = rows.filter((r) => r.status === "ready");
    if (ready.length === 0) return;

    setBusy(true);
    const toastId = notify.loading(`Creating ${ready.length} ${spec.entity.plural}…`);
    try {
      const res = await apiFetch(spec.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: ready.map((r) => r.data) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "The upload failed.");

      setResult(data);
      notify.dismiss(toastId);
      notify.success(
        `${data.summary.created} of ${data.summary.received} ${spec.entity.plural} created.`,
      );
      onCompleted?.(data);
    } catch (err: any) {
      notify.dismiss(toastId);
      notify.error(err.message ?? "The upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function downloadFailures() {
    if (!result) return;
    const bad = result.results.filter((r) => r.status !== "created");
    const byRow = new Map(rows.map((r) => [r.row, r.data]));
    const keys = spec.columns.map((c) => c.key);
    const header = [...keys, "error"].join(",");
    const lines = bad.map((r) => {
      const data = byRow.get(r.row) ?? {};
      return [...keys.map((k) => csvCell(data[k] ?? "")), csvCell(r.reason ?? "")].join(",");
    });
    download(`${header}\n${lines.join("\n")}\n`, `pes-${spec.id}-not-created.csv`);
  }

  const visibleRows = onlyProblems ? rows.filter((r) => r.status !== "ready") : rows;
  const canSubmit = counts.ready > 0 && !busy;

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => (open ? setIsOpen(true) : close())}
      title={`Create multiple ${spec.entity.plural}`}
      description="Upload a CSV. Everything is checked before anything is created."
      className="max-w-4xl"
      footer={
        result ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            {result.summary.created < result.summary.received ? (
              <Button variant="outline" onClick={downloadFailures}>
                Download the rows that were not created
              </Button>
            ) : null}
            <Button onClick={close}>Done</Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {rows.length === 0
                ? "No file loaded yet."
                : counts.ready === 0
                  ? "Nothing in this file can be created yet."
                  : `${counts.ready} of ${counts.total} rows will be created.`}
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              {/* AGENTS.md: a blocked control stays clickable and says why. */}
              <Button
                onClick={() =>
                  canSubmit
                    ? submit()
                    : notify.error(
                        rows.length === 0
                          ? "Upload a CSV first."
                          : "No rows are ready to create. Fix the errors listed and upload again.",
                      )
                }
                aria-disabled={!canSubmit}
                className={!canSubmit ? "opacity-50" : undefined}
                loading={busy}
              >
                {counts.ready > 0
                  ? `Create ${counts.ready} ${spec.entity.plural}`
                  : `Create ${spec.entity.plural}`}
              </Button>
            </div>
          </div>
        )
      }
    >
      {result ? (
        <ResultView result={result} entity={spec.entity} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-body">
              The file needs a header row. Required columns:{" "}
              <span className="font-medium text-strong">
                {spec.columns.filter((c) => c.required).map((c) => c.key).join(", ")}
              </span>
              .
            </p>
            <Button
              variant="outline"
              onClick={() =>
                download(templateCsv(spec.columns), `pes-${spec.id}-template.csv`)
              }
            >
              <DocumentDownload size={16} /> Download template
            </Button>
          </div>

          <FileUpload
            accept=".csv,text/csv"
            onFilesChange={handleFile}
            hint={`CSV only, up to ${maxRows} rows at a time.`}
          />

          {fileName ? (
            <p className="text-sm text-muted">
              Reading <span className="font-medium text-strong">{fileName}</span>
            </p>
          ) : null}

          {parseError ? <Alert tone="danger">{parseError}</Alert> : null}

          {headerCheck && !headerCheck.ok ? <HeaderProblems check={headerCheck} /> : null}

          {headerCheck?.ok && headerCheck.unrecognised.length > 0 ? (
            <Alert tone="warning">
              <p className="font-medium">
                {headerCheck.unrecognised.length} column
                {headerCheck.unrecognised.length === 1 ? " was" : "s were"} not recognised and will
                be ignored.
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {headerCheck.unrecognised.map((u) => (
                  <li key={u.header}>
                    <span className="font-mono">{u.header}</span>
                    {u.suggestion ? ` — did you mean "${u.suggestion}"?` : null}
                  </li>
                ))}
              </ul>
            </Alert>
          ) : null}

          {rows.length > 0 ? (
            <>
              <Alert tone={counts.invalid > 0 ? "warning" : "success"}>
                <p>
                  <strong className="tabular-nums">{counts.total}</strong> rows read.{" "}
                  <strong className="tabular-nums">{counts.ready}</strong> ready to create.
                  {counts.duplicate > 0 ? (
                    <>
                      {" "}
                      <strong className="tabular-nums">{counts.duplicate}</strong> duplicate
                      {counts.duplicate === 1 ? "" : "s"} removed.
                    </>
                  ) : null}
                  {counts.exists > 0 ? (
                    <>
                      {" "}
                      <strong className="tabular-nums">{counts.exists}</strong> already registered.
                    </>
                  ) : null}
                  {counts.invalid > 0 ? (
                    <>
                      {" "}
                      <strong className="tabular-nums">{counts.invalid}</strong> with errors.
                    </>
                  ) : null}
                </p>
              </Alert>

              {counts.total > counts.ready ? (
                <label className="flex items-center gap-2 text-sm text-body">
                  <input
                    type="checkbox"
                    checked={onlyProblems}
                    onChange={(e) => setOnlyProblems(e.target.checked)}
                  />
                  Show only rows that need attention
                </label>
              ) : null}

              <div className="max-h-80 overflow-auto rounded-lg border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-canvas">
                    <tr className="border-b border-line">
                      <th className="px-3 py-2 font-medium text-muted">Row</th>
                      {previewColumns.map((key) => (
                        <th key={key} className="px-3 py-2 font-medium text-muted">
                          {labelFor(spec.columns, key)}
                        </th>
                      ))}
                      <th className="px-3 py-2 font-medium text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((r) => (
                      <tr key={r.row} className="border-b border-line last:border-0 align-top">
                        <td className="px-3 py-2 tabular-nums text-muted">{r.row}</td>
                        {previewColumns.map((key) => (
                          <td key={key} className="px-3 py-2">
                            {r.data[key] || "—"}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                          {r.errors.length > 0 ? (
                            <ul className="mt-1 list-disc pl-4 text-xs text-muted">
                              {r.errors.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {spec.note ? (
                <p className="flex items-start gap-2 text-xs text-muted">
                  <InfoCircle size={14} className="mt-0.5 shrink-0" />
                  {spec.note}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      )}
    </Modal>
  );
}

function HeaderProblems({ check }: { check: HeaderCheck }) {
  return (
    <Alert tone="danger">
      <p className="font-medium">This file cannot be used as it is.</p>

      {check.missing.length > 0 ? (
        <>
          <p className="mt-2 text-sm">
            {check.missing.length} required column{check.missing.length === 1 ? " is" : "s are"}{" "}
            missing:
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {check.missing.map((c) => (
              <li key={c.key}>
                <span className="font-mono">{c.key}</span> ({c.label})
                {c.hint ? <span className="text-muted"> — {c.hint}</span> : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {check.duplicated.length > 0 ? (
        <>
          <p className="mt-2 text-sm">
            Two columns point at the same field, so the value would be ambiguous:
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {check.duplicated.map((d) => (
              <li key={d.column}>
                <span className="font-mono">{d.headers.join(" and ")}</span> both mean{" "}
                <span className="font-mono">{d.column}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {check.unrecognised.length > 0 ? (
        <>
          <p className="mt-2 text-sm">Columns that were not recognised:</p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {check.unrecognised.map((u) => (
              <li key={u.header}>
                <span className="font-mono">{u.header}</span>
                {u.suggestion ? ` — did you mean "${u.suggestion}"?` : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-3 text-sm">Download the template above for a file with the right columns.</p>
    </Alert>
  );
}

function ResultView({
  result,
  entity,
}: {
  result: BulkUploadResult;
  entity: { singular: string; plural: string };
}) {
  const notCreated = result.results.filter((r) => r.status !== "created");
  const emailFailed = result.results.filter((r) => r.emailFailed);

  return (
    <div className="space-y-4">
      <Alert tone={result.summary.failed > 0 ? "warning" : "success"}>
        <p>
          <strong className="tabular-nums">{result.summary.created}</strong> of{" "}
          <strong className="tabular-nums">{result.summary.received}</strong> {entity.plural}{" "}
          created.
          {result.summary.skipped > 0 ? (
            <>
              {" "}
              <strong className="tabular-nums">{result.summary.skipped}</strong> skipped.
            </>
          ) : null}
          {result.summary.failed > 0 ? (
            <>
              {" "}
              <strong className="tabular-nums">{result.summary.failed}</strong> failed.
            </>
          ) : null}
        </p>
        {typeof result.summary.emailsSent === "number" ? (
          <p className="mt-1 text-sm">
            {result.summary.emailsSent} credential email
            {result.summary.emailsSent === 1 ? "" : "s"} sent
            {result.summary.emailsFailed
              ? `, ${result.summary.emailsFailed} could not be delivered.`
              : "."}
          </p>
        ) : null}
      </Alert>

      {emailFailed.length > 0 ? (
        <Alert tone="warning">
          <p className="text-sm">
            These accounts were created but their credentials did not send. Use Resend credentials
            on the employee list.
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm">
            {emailFailed.map((r) => (
              <li key={r.row}>{r.key}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {notCreated.length > 0 ? (
        <div className="max-h-72 overflow-auto rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-canvas">
              <tr className="border-b border-line">
                <th className="px-3 py-2 font-medium text-muted">Row</th>
                <th className="px-3 py-2 font-medium text-muted">Record</th>
                <th className="px-3 py-2 font-medium text-muted">What happened</th>
              </tr>
            </thead>
            <tbody>
              {notCreated.map((r) => (
                <tr key={r.row} className="border-b border-line last:border-0 align-top">
                  <td className="px-3 py-2 tabular-nums text-muted">{r.row}</td>
                  <td className="px-3 py-2">{r.key || r.label || "—"}</td>
                  <td className="px-3 py-2">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
