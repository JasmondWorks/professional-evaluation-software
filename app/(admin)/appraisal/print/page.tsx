'use client';

import Link from 'next/link';
import { ArrowLeft2 } from 'iconsax-react';
import { PageHeader } from '@/app/components/ui';
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
        <Link
          href="/appraisal/entries"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-pes underline underline-offset-4 transition-colors hover:text-pes-800"
        >
          <ArrowLeft2 size={16} /> Back to appraisals
        </Link>

        <PageHeader
          title="Blank appraisal forms"
          subtitle="Print these, collect them on paper, then record the scores against each member of staff."
        />
      </div>

      <PrintablePanel />
    </div>
  );
}
