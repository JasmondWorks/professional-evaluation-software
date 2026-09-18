import type { ZodTypeAny } from 'zod';
import type { ColumnSpec } from './columns';

/** Everything one bulk upload needs to know about itself.
 *
 *  A spec is shared by the browser and the server: the same columns, the same
 *  schema, the same duplicate key. That is the point — the preview cannot
 *  promise something the server will then refuse.
 *
 *  Specs live next to the thing they create, e.g. app/lib/bulk-upload/specs/
 *  employees.ts. See ./README.md. */
export type BulkUploadSpec = {
  /** Stable id, used in the template filename and for telemetry. */
  id: string;
  /** What the rows are, singular and plural, for the copy: "employee". */
  entity: { singular: string; plural: string };
  columns: ColumnSpec[];
  /** Validates one row. Given the mapped row plus any `extraContext` the caller
   *  supplies, so a schema needing `org` still works client-side. */
  schema: ZodTypeAny;
  /** Field used to spot duplicates within the file, and to match against records
   *  that already exist. Compared case-insensitively. */
  dedupeKey: string;
  /** POST here with { rows }, GET here for existing keys and any reference data.
   *  Both are expected on the same route. */
  endpoint: string;
  /** Columns shown in the preview table. Defaults to the first four. */
  previewColumns?: string[];
  /** Server-refused rows the browser can also anticipate, e.g. a role that does
   *  not exist. Returned by the GET as `reference`. */
  referenceChecks?: {
    /** Key in the GET response holding the allowed values. */
    referenceKey: string;
    /** Column whose value must appear in that list. */
    column: string;
    /** Message when it does not. `value` is interpolated. */
    message: (value: string) => string;
  }[];
  /** Cap per upload, matched by the server. */
  maxRows?: number;
  /** Extra fields merged into each row before validation, client-side only.
   *  The server always sets these itself from the token. */
  clientContext?: Record<string, unknown>;
  /** A short note shown under the preview, e.g. how permissions are decided. */
  note?: string;
};

export const DEFAULT_MAX_ROWS = 500;
