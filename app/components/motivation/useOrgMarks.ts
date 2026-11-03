'use client';

// The two marks that belong on every award document.
//
// Page 1 of the client's specification has the software administrator set "the
// Institutional name, Logos (including the national coat of arm and
// institutions logo which will hence forth be seen on the software and on all
// documents-award certificates, Books of records and Hall of Fame record)".
//
// The session token carries the institution's logo but not the coat of arms,
// so the org record is read for both — one source of truth, rather than the
// token for one mark and a fetch for the other. The token's logo is returned
// straight away as a starting value so the artwork is never briefly blank, and
// is kept if the lookup fails: an award missing the coat of arms is still a
// valid award, whereas one that blanks on a slow request is not.

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '@/app/utils/auth';
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

  // The token only exists in the browser, so this runs after mount rather than
  // during render; reading it in render makes the server and client markup
  // disagree.
  useEffect(() => {
    let live = true;

    let decoded: any;
    try {
      const token = getAccessToken();
      if (!token) return;
      decoded = jwtDecode(token);
    } catch {
      return;
    }

    setMarks({
      logoUrl: decoded?.logo ?? null,
      coatOfArmsUrl: null,
      org: decoded?.org || '',
    });

    const orgId = decoded?.orgId;
    if (!orgId) return;

    (async () => {
      try {
        const res = await apiFetch(`/api/org/${orgId}`, { method: 'GET' });
        const body = await res.json();
        if (!live || !res.ok || !body?.data) return;
        setMarks({
          logoUrl: body.data.logo_url ?? decoded?.logo ?? null,
          coatOfArmsUrl: body.data.coat_of_arms_url ?? null,
          org: body.data.name || decoded?.org || '',
        });
      } catch {
        // Keep what the token gave us.
      }
    })();

    return () => {
      live = false;
    };
  }, []);

  return marks;
}
