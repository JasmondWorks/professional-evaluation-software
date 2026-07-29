// The product serves academic AND non-academic organizations (per subscription
// category). The higher-level grouping above a department — and the person who
// heads it — is named differently by sector, so the UI must adapt:
//
//   academic     → a "Faculty",  headed by a "Dean"
//   otherwise    → a "Division", headed by a "Manager"
//
// The internal role is generic ("unit-head") and the stored grouping field is
// pesuser.faculty_college; only the labels change.

export type OrgTerms = {
  unit: string; // singular, e.g. "Faculty"
  unitPlural: string; // e.g. "Faculties"
  head: string; // e.g. "Dean"
};

export function orgTerms(category?: string | null): OrgTerms {
  const c = (category || "").toLowerCase();
  if (c === "academic") {
    return { unit: "Faculty", unitPlural: "Faculties", head: "Dean" };
  }
  return { unit: "Division", unitPlural: "Divisions", head: "Manager" };
}
