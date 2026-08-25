'use client';


import { BackLink, PageHeader } from '@/app/components/ui';
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
      <BackLink href="/data-entry" className="mb-3">Back to data entry</BackLink>

      <PageHeader
        title="Departments awaiting your approval"
        subtitle="Approve a department once everyone has submitted and the departmental administrator has verified their forms."
      />

      <SubmissionsPanel />
    </div>
  );
}
