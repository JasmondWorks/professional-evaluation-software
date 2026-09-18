'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '@/app/utils/auth';

// Which sector the signed-in organization belongs to: 'academic', 'company' or
// 'public'. Several appraisal screens need it to decide whether academic staff
// exist at all — a company or a public body has none, so anything labelled
// "academic" or "non-academic" is noise there and the appraisal is simply the
// appraisal.

export function useOrgCategory(): string | null {
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const claims = jwtDecode(token) as any;
      setCategory(((claims?.productCategory ?? claims?.category ?? 'academic') as string).toLowerCase());
    } catch {
      setCategory('academic');
    }
  }, []);

  return category;
}

/** True for an institution of learning, which is the only sector with academic
 *  staff. Defaults to true until the token has been read, so an academic org
 *  never flashes the reduced layout. */
export function useIsAcademicOrg(): boolean {
  const category = useOrgCategory();
  return category === null || category === 'academic';
}

/** What the appraisal model is called for this sector. An institution of
 *  learning appraises academic and non-academic staff under one model; everybody
 *  else has one kind of staff and just calls it the appraisal. */
export function appraisalTitle(isAcademicOrg: boolean): string {
  return isAcademicOrg ? 'Institution of learning appraisal' : 'Appraisal';
}
