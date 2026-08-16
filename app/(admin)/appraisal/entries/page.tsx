'use client';

import Link from 'next/link';
import { ArrowLeft2 } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Button, PageHeader } from '@/app/components/ui';
import { getAccessToken } from '@/app/utils/auth';
import { ORG_ADMIN_ROLES } from '@/app/lib/appraisal/instrument';
import EntriesPanel from '../EntriesPanel';

/** The staff and head-of-department view of appraisal, reached from the Data
 *  Entry hub. Organization admins get the same list as a tab inside the
 *  appraisal model instead, alongside setup, submissions and results. */
export default function MyAppraisalsPage() {
  // Data Entry is not open to organization admins, so offering them a link to it
  // only sends them to an access-denied page.
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  useEffect(() => {
    const t = getAccessToken();
    if (!t) return;
    try {
      setIsOrgAdmin(ORG_ADMIN_ROLES.includes((jwtDecode(t) as any)?.role ?? ''));
    } catch {
      /* leave as staff */
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {!isOrgAdmin ? (
        <Link
          href="/data-entry"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-pes underline underline-offset-4 transition-colors hover:text-pes-800"
        >
          <ArrowLeft2 size={16} /> Back to data entry
        </Link>
      ) : null}

      <PageHeader
        title="Appraisal forms"
        subtitle="Enter your appraisal forms, and review anything waiting on you."
        actions={
          <Link href="/appraisal/print">
            <Button variant="secondary">Print blank forms</Button>
          </Link>
        }
      />

      <EntriesPanel />
    </div>
  );
}
