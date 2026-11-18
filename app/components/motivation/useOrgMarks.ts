'use client';

// The two marks that belong on every award document, plus the issuing
// organization's name.
//
// Page 1 of the client's specification has the software administrator set "the
// Institutional name, Logos (including the national coat of arm and
// institutions logo which will hence forth be seen on the software and on all
// documents-award certificates, Books of records and Hall of Fame record)".
//
// Everything comes from /api/org-marks, which resolves the organization from
// the verified token server-side. The first version of this hook read the
// access token on the client and decoded it for the org id — but the token is
// held in memory, not localStorage, so on a hard load of an award URL it was
// empty until a refresh completed, the hook bailed out, and the certificate
// rendered with no marks at all. apiFetch performs that refresh, so going
// through it means the marks arrive whenever the session does.

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/utils/apiFetch';

export type OrgMarks = {
  /** The organization's own logo. */
  logoUrl: string | null;
  /** The national coat of arms. */
  coatOfArmsUrl: string | null;
  /** Display name of the organization, for the certificate's issuer rule. */
  org: string;
};

export function useOrgMarks(): OrgMarks {
  const [marks, setMarks] = useState<OrgMarks>({
    logoUrl: null,
    coatOfArmsUrl: null,
    org: '',
  });

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await apiFetch('/api/org-marks', { method: 'GET' });
        const body = await res.json();
        if (!live || !res.ok) return;
        setMarks({
          logoUrl: body.logoUrl ?? null,
          coatOfArmsUrl: body.coatOfArmsUrl ?? null,
          org: body.org ?? '',
        });
      } catch {
        // An award without its marks is still a valid award; leave the blanks.
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return marks;
}
