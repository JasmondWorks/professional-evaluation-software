'use client';


import { BackLink, PageHeader } from '@/app/components/ui';
import PrintablePanel from '../PrintablePanel';

/** Blank Forms 8 and 9, for the departmental administrator.
 *
 *  The client was explicit on 11 Aug: the organization administrator is not the
 *  person who prints these. The departmental administrator prints them, collects
 *  them on paper, and records the scores. So this lives on the departmental side
 *  of the app rather than as a tab inside the organization admin's workspace. */
export default function PrintFormsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="print:hidden">
        <BackLink href="/appraisal/entries" className="mb-3">Back to appraisals</BackLink>

        <PageHeader
          title="Blank appraisal forms"
          subtitle="Print these, collect them on paper, then record the scores against each member of staff."
        />
      </div>

      <PrintablePanel />
    </div>
  );
}
