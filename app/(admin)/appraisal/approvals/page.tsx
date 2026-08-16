'use client';

import Link from 'next/link';
import { ArrowLeft2 } from 'iconsax-react';
import { PageHeader } from '@/app/components/ui';
import SubmissionsPanel from '../SubmissionsPanel';

/** The Dean's approval page.
 *
 *  Deans approve a department's submissions once everyone in it has submitted
 *  and the departmental administrator has verified Forms 8 and 9. They do not
 *  score individual staff.
 *
 *  This control previously existed only inside the organization admin's
 *  workspace, which Deans cannot reach, so there was no way for them to approve
 *  anything at all. */
export default function DeanApprovalsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/data-entry"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-pes underline underline-offset-4 transition-colors hover:text-pes-800"
      >
        <ArrowLeft2 size={16} /> Back to data entry
      </Link>

      <PageHeader
        title="Departments awaiting your approval"
        subtitle="Approve a department once everyone has submitted and the departmental administrator has verified their forms."
      />

      <SubmissionsPanel />
    </div>
  );
}
