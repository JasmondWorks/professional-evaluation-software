/** The spreadsheet contract for any bulk upload.
 *
 *  Nothing here knows about employees. A caller describes its columns once and
 *  gets the template, the header check and the near-miss suggestions from that
 *  one description, so the file an admin downloads and the file the server
 *  accepts cannot drift apart.
 *
 *  See ./README.md for how to add a new upload. */

export type ColumnSpec = {
  /** The field name used in the payload sent to the server. */
  key: string;
  /** Human label, shown in error messages and template hints. */
  label: string;
  required: boolean;
  /** What to write in the template's example row. */
  example: string;
  /** Spellings seen in the wild, so a stray header gets a suggested correction
   *  rather than a bare "not recognised". Compared after normalisation. */
  aliases?: string[];
  /** Shown when the column is missing, to explain the expected format. */
  hint?: string;
};

/** Header matching is forgiving about case, spacing and punctuation, because a
 *  file rejected over "Date Of Birth" versus "dob" helps nobody. */
export function normalizeHeader(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s._-]+/g, ' ');
}

function lookupFor(columns: ColumnSpec[]): Map<string, string> {
  const lookup = new Map<string, string>();
  for (const col of columns) {
    lookup.set(normalizeHeader(col.key), col.key);
    lookup.set(normalizeHeader(col.label), col.key);
    for (const alias of col.aliases ?? []) lookup.set(normalizeHeader(alias), col.key);
  }
  return lookup;
}

/** Levenshtein, capped: only used to suggest a correction for a stray header. */
function distance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const row = [i];
    for (let j = 1; j <= n; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[n];
}

export type HeaderCheck = {
  ok: boolean;
  /** header exactly as written in the file -> column key */
  mapping: Record<string, string>;
  missing: ColumnSpec[];
  /** Headers nothing recognised, each with a suggestion where one is close. */
  unrecognised: { header: string; suggestion?: string }[];
  /** Two headers pointing at one column, which makes the row ambiguous. */
  duplicated: { column: string; headers: string[] }[];
};

/** Check a file's headers before showing a single row. A file missing required
 *  columns is refused outright, and the caller is told exactly which are missing
 *  and what to rename. */
export function checkHeaders(columns: ColumnSpec[], headers: string[]): HeaderCheck {
  const lookup = lookupFor(columns);
  const mapping: Record<string, string> = {};
  const unrecognised: { header: string; suggestion?: string }[] = [];
  const seen: Record<string, string[]> = {};

  const suggestFor = (header: string): string | undefined => {
    const norm = normalizeHeader(header);
    let best: { key: string; d: number } | null = null;
    for (const [known, key] of lookup) {
      const d = distance(norm, known);
      if (d <= 3 && (!best || d < best.d)) best = { key, d };
    }
    return best?.key;
  };

  for (const header of headers) {
    const trimmed = header.trim();
    if (trimmed === '') continue;
    const key = lookup.get(normalizeHeader(trimmed)) ?? null;
    if (!key) {
      unrecognised.push({ header: trimmed, suggestion: suggestFor(trimmed) });
      continue;
    }
    mapping[trimmed] = key;
    (seen[key] ||= []).push(trimmed);
  }

  const present = new Set(Object.values(mapping));
  const missing = columns.filter((c) => c.required && !present.has(c.key));
  const duplicated = Object.entries(seen)
    .filter(([, hs]) => hs.length > 1)
    .map(([column, headers]) => ({ column, headers }));

  return {
    ok: missing.length === 0 && duplicated.length === 0,
    mapping,
    missing,
    unrecognised,
    duplicated,
  };
}

/** The template offered for download, so the correct shape is one click away
 *  rather than something to reconstruct from an error message. */
export function templateCsv(columns: ColumnSpec[]): string {
  const header = columns.map((c) => c.key).join(',');
  const example = columns.map((c) => csvCell(c.example)).join(',');
  return `${header}\n${example}\n`;
}

export function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function requiredKeys(columns: ColumnSpec[]): string[] {
  return columns.filter((c) => c.required).map((c) => c.key);
}

export function labelFor(columns: ColumnSpec[], key: string): string {
  return columns.find((c) => c.key === key)?.label ?? key;
}
