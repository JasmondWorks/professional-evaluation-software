import { NextResponse } from 'next/server';
import type { ZodTypeAny } from 'zod';
import { validateData, formatZodErrors } from '@/app/lib/validation';
import { DEFAULT_MAX_ROWS } from '@/app/lib/bulk-upload/spec';

/** The server half of a bulk upload, shared by every upload route.
 *
 *  The browser validates the same rows with the same schema before anything is
 *  sent, but that is convenience. This is the enforcement: a request can be
 *  posted straight here without ever opening the modal.
 *
 *  Rows are processed one at a time rather than in a single transaction. One bad
 *  row out of fifty must not roll back the forty-nine good ones — the uploader
 *  wants the good rows in and a list of what to fix.
 *
 *  See app/lib/bulk-upload/README.md. */

export type RowOutcome =
  | { status: 'created'; key?: string; label?: string }
  /** Nothing wrong with the file; this record simply cannot be created (already
   *  exists, conflicts with an existing record). */
  | { status: 'skipped'; reason: string; key?: string; label?: string }
  /** The row itself is wrong and the uploader must change it. */
  | { status: 'failed'; reason: string; key?: string; label?: string };

export type RowResult = RowOutcome & { row: number; emailFailed?: boolean };

export type BulkRunOptions<T> = {
  rows: unknown[];
  schema: ZodTypeAny;
  /** Merged into every row before validation, from the verified token. Never
   *  taken from the request body. */
  context: Record<string, unknown>;
  /** Field used to spot duplicates within one file. Compared lower-cased. */
  dedupeKey?: string;
  maxRows?: number;
  /** Cheap checks that do not need a write, e.g. "does this role exist".
   *  Results are cached per distinct value across the whole file. */
  precheck?: (row: T) => Promise<string | null>;
  /** Creates one record. Must not throw: return a failed outcome instead. */
  create: (row: T) => Promise<RowOutcome>;
  /** Runs once after every row is decided, e.g. sending credential emails.
   *  Returning per-key failures marks those rows. */
  after?: (created: { row: number; record: T }[]) => Promise<{
    emailsSent?: number;
    failedKeys?: string[];
  } | void>;
};

export async function runBulkUpload<T extends Record<string, any>>(
  options: BulkRunOptions<T>,
): Promise<Response> {
  const {
    rows, schema, context, dedupeKey, precheck, create, after,
    maxRows = DEFAULT_MAX_ROWS,
  } = options;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ message: 'No rows were sent.' }, { status: 400 });
  }
  if (rows.length > maxRows) {
    return NextResponse.json(
      { message: `That file has ${rows.length} rows. Upload at most ${maxRows} at a time.` },
      { status: 400 },
    );
  }

  const results: RowResult[] = [];
  const seen = new Set<string>();
  const created: { row: number; record: T }[] = [];
  const precheckCache = new Map<string, string | null>();

  for (let i = 0; i < rows.length; i++) {
    // Row numbers are the ones the uploader sees in their spreadsheet: the
    // header is row 1, so the first data row is row 2.
    const row = i + 2;
    const raw: any = { ...(rows[i] as any), ...context };

    const key = dedupeKey ? String(raw[dedupeKey] ?? '').trim().toLowerCase() : '';
    if (dedupeKey && key) raw[dedupeKey] = key;

    // Duplicates within the file. The browser removes these before sending, but
    // a direct post would not have.
    if (key && seen.has(key)) {
      results.push({
        row, key, status: 'skipped',
        reason: `This ${dedupeKey} appears more than once in the file.`,
      });
      continue;
    }
    if (key) seen.add(key);

    const validation = validateData(schema, raw);
    if (!validation.success) {
      const details = formatZodErrors(validation.errors!);
      results.push({
        row, key, status: 'failed',
        reason: Object.entries(details)
          .map(([field, message]) => `${field}: ${message}`)
          .join('; '),
      });
      continue;
    }

    if (precheck) {
      const cacheKey = JSON.stringify(raw);
      let problem: string | null;
      if (precheckCache.has(cacheKey)) {
        problem = precheckCache.get(cacheKey)!;
      } else {
        problem = await precheck(raw as T);
        precheckCache.set(cacheKey, problem);
      }
      if (problem) {
        results.push({ row, key, status: 'failed', reason: problem });
        continue;
      }
    }

    const outcome = await create(raw as T);
    results.push({ row, key, ...outcome });
    if (outcome.status === 'created') created.push({ row, record: raw as T });
  }

  let emailsSent: number | undefined;
  let emailsFailed: number | undefined;
  if (after) {
    const summary = await after(created);
    if (summary) {
      emailsSent = summary.emailsSent;
      const failed = summary.failedKeys ?? [];
      emailsFailed = failed.length;
      for (const r of results) {
        if (r.status === 'created' && r.key && failed.includes(r.key)) r.emailFailed = true;
      }
    }
  }

  return NextResponse.json({
    summary: {
      received: rows.length,
      created: results.filter((r) => r.status === 'created').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      failed: results.filter((r) => r.status === 'failed').length,
      ...(emailsSent === undefined ? {} : { emailsSent, emailsFailed }),
    },
    results,
  });
}
