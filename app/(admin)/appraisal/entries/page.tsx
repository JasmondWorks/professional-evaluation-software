'use client';

import Link from 'next/link';
import { ArrowLeft2 } from 'iconsax-react';
import { PageHeader } from '@/app/components/ui';
import EntriesPanel from '../EntriesPanel';

/** The staff and head-of-department view of appraisal, reached from the Data
 *  Entry hub. Organization admins get the same list as a tab inside the
 *  appraisal model instead, alongside setup, submissions and results. */
export default function MyAppraisalsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/data-entry"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-pes"
      >
        <ArrowLeft2 size={16} /> Back to data entry
      </Link>

      <PageHeader
        title="Appraisal forms"
        subtitle="Enter your appraisal forms, and review anything waiting on you."
      />

      <EntriesPanel />
    </div>
  );
}
