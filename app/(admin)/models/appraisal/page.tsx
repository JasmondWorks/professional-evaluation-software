'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft2 } from 'iconsax-react';
import { PageHeader } from '@/app/components/ui';
import AppraisalSetup from '@/app/(admin)/appraisal/AppraisalSetup';
import EntriesPanel from '@/app/(admin)/appraisal/EntriesPanel';
import ResultsPanel from '@/app/(admin)/appraisal/ResultsPanel';
import SubmissionsPanel from '@/app/(admin)/appraisal/SubmissionsPanel';

/** The appraisal model's home. Everything the organization admin does for
 *  appraisal lives here rather than as separate nav links, matching how the
 *  stress model is organised. */
const TABS = [
  { key: 'setup', label: 'Setup', hint: 'Period, targets and courses' },
  { key: 'entries', label: 'Appraisals', hint: 'Who is being appraised' },
  { key: 'submissions', label: 'Submissions', hint: 'Who has not submitted' },
  { key: 'results', label: 'Results', hint: 'Evaluate and release' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function AppraisalModelPage() {
  const [tab, setTab] = useState<TabKey>('setup');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/models"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-pes"
      >
        <ArrowLeft2 size={16} /> Back to models
      </Link>

      <PageHeader
        title="Staff appraisal"
        subtitle="Open the period, set the targets, then run and release the evaluation. Departments enter the scores."
      />

      <div
        role="tablist"
        aria-label="Appraisal sections"
        className="mb-6 flex flex-wrap gap-1 border-b border-line"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            title={t.hint}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:shadow-focus ${
              tab === t.key
                ? 'border-pes text-pes-700'
                : 'border-transparent text-muted hover:text-strong'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'setup' ? <AppraisalSetup /> : null}
      {tab === 'entries' ? <EntriesPanel /> : null}
      {tab === 'submissions' ? <SubmissionsPanel /> : null}
      {tab === 'results' ? <ResultsPanel /> : null}
    </div>
  );
}
